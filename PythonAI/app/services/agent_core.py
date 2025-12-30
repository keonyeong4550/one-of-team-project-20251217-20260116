import json
import time
from datetime import datetime
from typing import Optional, List, Tuple

# [변경 1] Google LLM -> Ollama LLM 교체
from langchain_community.chat_models import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser, PydanticOutputParser
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.logger import app_logger
from app.models.dtos import MediationRequest, MediationResponse, TicketSchema
from app.models.dtos import ChatMessage
from app.services.prompt_manager import PromptManager
from app.services.rag_service import rag_service
from app.db.rdb import rdb

# ---------------------------------------------------------
# LLM 내부 사고 모델 (Structured Output)
# ---------------------------------------------------------
class AgentReasoning(BaseModel):
    analysis: str = Field(..., description="사용자 입력 분석 및 의도 파악")
    updated_ticket: TicketSchema = Field(..., description="업데이트된 티켓 데이터 (기존 데이터 유지 필수)")
    response_to_user: str = Field(..., description="사용자에게 보낼 응답 (질문 시 구체적으로)")

class AgentCoreService:
    def __init__(self):
        # [변경 2] Ollama(Qwen) 인스턴스 초기화
        # Qwen 모델은 'System Message' 지원이 탁월하므로 설정 유지
        app_logger.info(f"Initializing LLM: Ollama ({settings.MODEL_NAME})...")
        
        self.llm = ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.MODEL_NAME,
            temperature=settings.TEMPERATURE,  # 0.0으로 설정됨 (환각 억제)
            format="json"  # [중요] Qwen에게 JSON 출력을 강제하는 옵션
        )
        
        # [변경 3] 일반 대화용(라우팅 등)은 format="json" 옵션이 없는 별도 인스턴스 사용 권장
        # 라우팅은 단순 텍스트("DEVELOPMENT" 등)만 뱉어야 하므로 JSON 모드 끔
        self.text_llm = ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.MODEL_NAME,
            temperature=settings.TEMPERATURE,
        )

        # 2. 라우팅용 체인 (Text LLM 사용)
        self.routing_chain = (
            PromptManager.get_routing_prompt() 
            | self.text_llm 
            | StrOutputParser()
        )
        
        # 3. 구조화된 파서
        self.parser = PydanticOutputParser(pydantic_object=AgentReasoning)

    async def process_request(self, request: MediationRequest) -> MediationResponse:
        app_logger.info(f"Processing Request | ConvID: {request.conversation_id}")
        
        current_ticket = request.current_ticket
        target_dept = request.target_dept
        
        # 대화 내역 포맷팅
        formatted_history = self._format_chat_history(request.chat_history, request.user_input)

        # ------------------------------------------------------------------
        # [Step 1] 부서 라우팅
        # ------------------------------------------------------------------
        if not target_dept:
            app_logger.info("Step 1: Routing")
            
            try:
                routing_result = await self.routing_chain.ainvoke({
                    "chat_history": formatted_history,
                    "user_input": request.user_input
                })
                routing_result = routing_result.strip()
                
                # Qwen 모델이 가끔 설명충처럼 말할 때를 대비한 파싱 로직 강화
                if "QUESTION:" in routing_result:
                    # "QUESTION: 어쩌구" 부분만 추출
                    parts = routing_result.split("QUESTION:")
                    ai_question = parts[-1].strip()
                    return self._create_response(request, message=ai_question, is_completed=False)
                
                # 부서명만 깔끔하게 추출 (예: "답변: DEVELOPMENT" 라고 할 경우 대비)
                identified_dept = self._extract_dept_name(routing_result)
                
                if not identified_dept or "UNKNOWN" in identified_dept:
                     return self._create_response(
                        request, 
                        "죄송합니다. 말씀하신 내용만으로는 어느 부서 업무인지 파악하기 어렵습니다. 조금 더 구체적으로 말씀해 주시겠어요?",
                        is_completed=False
                    )
                
                # 정상 라우팅
                ai_msg = f"네, 말씀하신 내용은 **[{identified_dept}]** 부서 업무로 확인됩니다.\n\n혹시 해당 부서에 지정해서 요청하실 **담당자**분이 계신가요?\n(없으시면 '없음'이라고 말씀해 주세요.)"
                
                return self._create_response(
                    request,
                    message=ai_msg,
                    identified_dept=identified_dept,
                    is_completed=False
                )
            except Exception as e:
                app_logger.error(f"Routing Failed: {str(e)}")
                return self._create_response(request, "부서 확인 중 오류가 발생했습니다. 다시 말씀해 주세요.", is_completed=False)

        # ------------------------------------------------------------------
        # [Step 2] 담당자 확인 (DB 연동)
        # ------------------------------------------------------------------
        if not current_ticket.receivers:
            app_logger.info(f"Step 2: Assignee Check for {target_dept}")
            
            # AI에게 이름 추출 요청 (Text LLM 사용)
            chain = PromptManager.get_assignee_check_prompt() | self.text_llm | StrOutputParser()
            try:
                extracted_assignee = await chain.ainvoke({"user_input": request.user_input})
                assignee_val = extracted_assignee.strip().replace('"', '').replace("'", "") # 따옴표 제거
            except Exception as e:
                app_logger.error(f"Assignee Check Failed: {str(e)}")
                assignee_val = "Team_Common" # 에러 시 기본값
            
            final_receivers = []
            ai_msg = ""
            
            # [Logic] 담당자 없음 / 모름 / 공통 -> 부서 전체 조회
            if any(x in assignee_val for x in ["Team_Common", "없음", "모름", "None", "상관없음"]):
                dept_emails = rdb.find_emails_by_department(target_dept)
                
                if dept_emails:
                    final_receivers = dept_emails
                    ai_msg = f"네, 특정 담당자가 지정되지 않아 **[{target_dept}]** 부서원 전체({len(dept_emails)}명)에게 티켓을 발송합니다."
                else:
                    ai_msg = f"현재 **[{target_dept}]** 부서에 등록된 사원이 없습니다. 관리자에게 문의해 주세요."
                    return self._create_response(request, message=ai_msg, identified_dept=target_dept, is_completed=False)

            # [Logic] 특정 담당자 지목 -> DB 조회
            else:
                found_email = rdb.find_email_by_name(assignee_val)
                
                if found_email:
                    final_receivers = [found_email]
                    ai_msg = f"네, 담당자 **{assignee_val}**님(ID: {found_email})을 지정했습니다."
                else:
                    ai_msg = f"죄송합니다. 말씀하신 담당자 **'{assignee_val}'**님을 시스템에서 찾을 수 없습니다.\n정확한 성함을 다시 말씀해 주시거나, 담당자가 없으면 '없음'이라고 해주세요."
                    return self._create_response(request, message=ai_msg, identified_dept=target_dept, is_completed=False)
            
            current_ticket.receivers = final_receivers
            ai_msg += "\n\n이제 요청하실 업무 내용을 구체적으로 말씀해 주세요."
            
            return self._create_response(
                request,
                message=ai_msg,
                updated_ticket=current_ticket,
                identified_dept=target_dept,
                is_completed=False
            )

        # ------------------------------------------------------------------
        # [Step 3] RAG 기반 심층 인터뷰
        # ------------------------------------------------------------------
        app_logger.info(f"Step 3: Interview for {target_dept}")
        
        rag_context = await rag_service.get_context(target_dept, request.user_input)
        _, missing_fields = self._validate_ticket(current_ticket)
        
        if missing_fields:
            missing_info_instruction = f"현재 {', '.join(missing_fields)} 정보가 누락되었습니다. 사용자에게 이 내용을 반드시 질문하십시오."
        else:
            missing_info_instruction = "모든 필수 정보가 입력되었습니다. 티켓 내용을 최종 정리하고 사용자가 확인할 수 있게 하십시오."

        prompt = PromptManager.get_interview_prompt().format_messages(
            target_dept=target_dept,
            rag_context=rag_context,
            current_date=datetime.now().strftime("%Y-%m-%d"),
            chat_history=formatted_history, 
            current_ticket_json=current_ticket.model_dump_json(by_alias=True),
            user_input=request.user_input,
            missing_info_instruction=missing_info_instruction,
            format_instructions=self.parser.get_format_instructions()
        )

        try:
            # [변경 4] Ollama 호출 시 JSON 모드 사용 (self.llm 사용)
            raw_response = await self.llm.ainvoke(prompt)
            
            # Qwen이 가끔 JSON 코드블록(```json ... ```)으로 감싸서 줄 때가 있음. 제거 로직.
            content = raw_response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].strip()
            
            result = self.parser.parse(content)
            
        except Exception as e:
            app_logger.error(f"Ollama/Parsing Error: {str(e)}")
            # 에러 발생 시 원본 응답 로그 남겨서 디버깅 용이하게
            if 'raw_response' in locals():
                app_logger.error(f"Raw Response: {raw_response.content}")
                
            return self._create_response(request, "죄송합니다. AI 처리 중 일시적인 오류가 발생했습니다. 다시 한번 말씀해 주시겠어요?", is_completed=False)

        final_ticket = result.updated_ticket
        
        if not final_ticket.receivers and current_ticket.receivers:
            final_ticket.receivers = current_ticket.receivers

        is_really_completed, final_missing_fields = self._validate_ticket(final_ticket)
        final_msg = result.response_to_user
        
        if is_really_completed:
            final_ticket.completion_rate = 100
            final_msg += "\n\n✅ **필수 정보가 모두 확인되었습니다. 우측의 [업무 티켓 전송] 버튼을 눌러주세요.**"
            next_action = "suggest_submit"
        else:
            if final_ticket.completion_rate >= 100:
                final_ticket.completion_rate = 90
            next_action = "continue_chat"

        return self._create_response(
            request,
            message=final_msg,
            updated_ticket=final_ticket,
            identified_dept=target_dept,
            is_completed=is_really_completed,
            next_action=next_action,
            missing_info_list=final_missing_fields
        )

    def _extract_dept_name(self, text: str) -> Optional[str]:
        """[Helper] LLM 응답에서 부서명만 안전하게 추출"""
        valid_depts = ["DEVELOPMENT", "DESIGN", "SALES", "HR", "FINANCE", "PLANNING"]
        text_upper = text.upper()
        for dept in valid_depts:
            if dept in text_upper:
                return dept
        return None if "UNKNOWN" in text_upper else text # UNKNOWN이면 None, 아니면 원본 반환

    def _format_chat_history(self, history: List[ChatMessage], current_input: str):
        if not history:
            return []
        messages_to_process = history[-10:]
        if messages_to_process and messages_to_process[-1].role == "user" and messages_to_process[-1].content == current_input:
            messages_to_process.pop()
        formatted = []
        for msg in messages_to_process:
            if msg.role == "user":
                new_msg = HumanMessage(content=msg.content)
            elif msg.role == "assistant":
                new_msg = AIMessage(content=msg.content)
            else:
                continue
            if formatted and isinstance(formatted[-1], type(new_msg)):
                formatted[-1].content += f"\n\n{new_msg.content}"
            else:
                formatted.append(new_msg)
        return formatted

    def _validate_ticket(self, ticket: TicketSchema) -> Tuple[bool, List[str]]:
        missing = []
        if not ticket.title or len(ticket.title) < 2: missing.append("제목(Title)")
        if not ticket.content or len(ticket.content) < 2: missing.append("요약(Content)")
        if not ticket.requirement or len(ticket.requirement) < 2: missing.append("상세내용(Requirement)")
        if not ticket.deadline: missing.append("마감일(Deadline)")
        if not ticket.grade: missing.append("중요도(Grade)")
        if not ticket.receivers or len(ticket.receivers) == 0: missing.append("담당자(Receiver)")
        is_completed = (len(missing) == 0)
        return is_completed, missing

    def _create_response(self, request, message, updated_ticket=None, identified_dept=None, is_completed=False, next_action="continue_chat", missing_info_list=None):
        return MediationResponse(
            conversation_id=request.conversation_id,
            ai_message=message,
            updated_ticket=updated_ticket if updated_ticket else request.current_ticket,
            identified_target_dept=identified_dept if identified_dept else request.target_dept,
            is_completed=is_completed,
            next_action=next_action,
            missing_info_list=missing_info_list or []
        )

agent_core = AgentCoreService()