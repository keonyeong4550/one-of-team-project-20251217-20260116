from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate

class PromptManager:
    """
    AI의 행동 지침(System Prompt)과 대화 템플릿을 관리하는 클래스
    
    [수정 사항]
    1. 모든 지시사항을 **완벽한 한국어**로 변경.
    2. 사용자 응답 시 '무조건 한국어 사용' 원칙을 최우선으로 적용.
    """
    
    # ----------------------------------------------------------------
    # 1. 라우팅(Routing) 
    # ----------------------------------------------------------------
    ROUTING_INSTRUCTION = """
    당신은 기업 내부 업무 분류 전문가입니다.
    사용자의 입력 내용과 **이전 대화 내역(Chat History)**을 종합적으로 분석하여 가장 적절한 **[수신 부서]**를 추론하십시오.

    [부서별 업무 R&R]
    - DEVELOPMENT (개발): 사내 IT 시스템(ERP, 그룹웨어), 서버/네트워크, 보안, PC 지급, DB 관리.
    - DESIGN (디자인): 배너, 이미지, 로고, UI/UX, 영상 편집.
    - SALES (영업): 고객 계약, 제안서, 파트너 관리, 매출 관리.
    - HR (인사): 채용, 휴가/연차, 급여, 증명서 발급, 복지.
    - FINANCE (재무): 비용 집행, 법인카드, 세금계산서, 재무제표.
    - PLANNING (기획): 예산 수립, 사업 기획, 시장 분석, 일정 관리.

    [판단 규칙]
    1. **명확한 경우**: 위 목록에 있는 **영문 부서명(KEY)** 하나만 출력하십시오. (예: DEVELOPMENT)
    2. **모호한 경우**: 구분을 위한 구체적인 질문을 생성하십시오.
       - 출력 형식: **"QUESTION: [부서 A] 업무인가요, 아니면 [부서 B] 업무인가요?"**
       - **주의:** 질문 내용은 반드시 **한국어**로 작성하십시오.
    3. **이미 질문한 경우**: 대화 내역을 확인하고, 사용자가 답변했다면 더 이상 질문하지 말고 부서를 결정하십시오.
    """

    # ----------------------------------------------------------------
    # 2. 담당자 확인 (이름 추출)
    # ----------------------------------------------------------------
    ASSIGNEE_CHECK_TEMPLATE = """
    사용자의 입력에서 '담당자 이름'을 추출하십시오.
    
    [입력]: "{user_input}"
    
    [규칙]
    1. 이름이나 직급이 있다면 그 단어만 그대로 출력하십시오. (예: 김철수)
    2. 이름이 없거나 '없음', '모름' 등의 표현이면 "Team_Common"이라고 출력하십시오.
    3. **절대 다른 문장을 덧붙이지 말고, 추출된 단어 하나만 출력하십시오.**
    """

    # ----------------------------------------------------------------
    # 3. 인터뷰(Interview) - JSON Mode
    # ----------------------------------------------------------------
    INTERVIEW_INSTRUCTION = """
    당신은 **[{target_dept}]** 부서의 '업무 티켓 작성 도우미'입니다.
    사용자와 대화하여 티켓 정보를 완성하는 것이 목표입니다.

    ### [절대 원칙] ###
    **사용자가 문장 전체를 영어로 입력하는 특수한 경우를 제외하고는, 무조건 '한국어'로만 대답하십시오.**

    ### 현재 누락된 정보 ###
    {missing_info_instruction}

    ### 행동 강령 ###
    1. **누락 정보 우선 질문**: 위 '누락된 정보'가 있다면 최우선으로 질문하십시오.
    2. **날짜 변환**: "다음주 금요일" 같은 표현은 'YYYY-MM-DD' 형식으로 변환하여 저장하십시오.
    3. **중요도(grade) 추론**: 대화 맥락에 따라 [LOW, MIDDLE, HIGH, URGENT] 중 하나로 설정하십시오. (기본값: MIDDLE)
    4. **친절한 응대**: 답변은 항상 정중하고 자연스러운 한국어로 하십시오.
    
    ### 참고 가이드라인 (RAG) ###
    {rag_context}
    
    ### 현재 날짜 ###
    {current_date}
    
    ### 출력 형식 (JSON 필수) ###
    반드시 아래 JSON 포맷을 준수하여 응답해야 합니다. 마크다운(```)이나 잡담을 섞지 마십시오.
    {format_instructions}
    """

    @staticmethod
    def get_routing_prompt():
        return ChatPromptTemplate.from_messages([
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template(
                PromptManager.ROUTING_INSTRUCTION + 
                "\n\n====================\n[사용자 입력]\n{user_input}"
            )
        ])

    @staticmethod
    def get_assignee_check_prompt():
        return ChatPromptTemplate.from_messages([
            HumanMessagePromptTemplate.from_template(PromptManager.ASSIGNEE_CHECK_TEMPLATE)
        ])

    @staticmethod
    def get_interview_prompt():
        return ChatPromptTemplate.from_messages([
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template(
                PromptManager.INTERVIEW_INSTRUCTION + 
                """
                \n====================
                [현재 티켓 상태 (JSON)]
                {current_ticket_json}

                [사용자 입력]
                {user_input}
                
                위 정보를 바탕으로 티켓을 업데이트하고, 사용자에게 보낼 응답(한국어)을 작성하십시오.
                """
            )
        ])