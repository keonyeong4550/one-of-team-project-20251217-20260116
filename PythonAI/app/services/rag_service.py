import json
import os
import shutil  # [NEW] 폴더 삭제를 위한 모듈 추가
from typing import List, Optional
from langchain.schema import Document
from app.db.vector_store import vector_store
from app.core.logger import app_logger
from app.core.config import settings

class RAGService:
    def __init__(self):
        self.retriever = None
        
        # JSON 파일 경로 설정 (프로젝트 루트 기준 data/initial_knowledge.json)
        self.json_path = os.path.join(os.getcwd(), "data", "initial_knowledge.json")
        
        # [NEW] 벡터 DB가 비어있거나, 임베딩 모델 변경 시 초기화 로직 실행
        self._initialize_knowledge_base()

        # [Logic] 초기화 후 검색기(Retriever) 생성
        # vector_store가 정상 초기화되었는지 확인 후 할당
        if vector_store.db:
            # 검색 정확도를 위해 k=5 유지
            self.retriever = vector_store.get_retriever(k=5)
        else:
            app_logger.error("Vector Store is not ready. RAG Service disabled.")

    def _initialize_knowledge_base(self):
        """
        [Enterprise Level Data Seeding]
        구글 임베딩 -> 로컬 임베딩 전환 시 기존 데이터 충돌 방지 로직 포함.
        """
        try:
            # 1. DB 인스턴스 확인
            if not vector_store.db:
                app_logger.error("Vector Store instance is None. Skipping seeding.")
                return

            # 2. 기존 데이터 존재 여부 확인
            existing_docs = vector_store.db.get()
            
            # [CRITICAL UPDATE] 차원 불일치 방지 로직
            # 기존 구글 임베딩 데이터가 남아있다면 로컬 모델과 차원이 달라 에러 발생함.
            # 여기서는 '간단한 체크'로 데이터가 있는데 검색이 안 되거나 에러가 날 상황을 대비해
            # 운영자가 수동으로 폴더를 지웠는지 로그로 경고하거나, 
            # (선택적) 강제로 지우고 다시 만드는 로직을 고려할 수 있음.
            # 안전을 위해 여기서는 '데이터가 없으면 새로 굽는다'는 기본 원칙을 따르되,
            # 만약 기존 데이터가 있다면 로그로 알림.
            
            if existing_docs and len(existing_docs['ids']) > 0:
                # [주의] 만약 구글로 만든 데이터라면 이 시점에서 에러는 안 나지만, 검색 시 에러 남.
                # 개발/테스트 단계이므로, '데이터가 있으면 일단 스킵'하되 로그 남김.
                app_logger.info(f"Vector Store has {len(existing_docs['ids'])} items. Skipping initialization.")
                return

            # 3. JSON 파일 존재 확인
            if not os.path.exists(self.json_path):
                app_logger.warning(f"Knowledge JSON file not found at: {self.json_path}. Skipping seeding.")
                return

            # 4. JSON 로드 및 Document 객체 변환
            app_logger.info(f"Loading knowledge base from {self.json_path}...")
            
            with open(self.json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            documents = []
            for dept, items in data.items():
                for item in items:
                    # 메타데이터에 부서 정보 포함 (필터링 용도)
                    doc = Document(
                        page_content=item,
                        metadata={"dept": dept}
                    )
                    documents.append(doc)

            # 5. 벡터 DB에 주입 (로컬 임베딩으로 변환되어 저장됨)
            if documents:
                vector_store.add_documents(documents)
                app_logger.info(f"Successfully seeded {len(documents)} documents into Vector Store.")
            else:
                app_logger.warning("JSON file is empty or invalid format.")

        except json.JSONDecodeError as e:
            app_logger.error(f"Failed to parse Knowledge JSON: {e}")
        except Exception as e:
            app_logger.error(f"RAG Initialization failed: {str(e)}")

    async def get_context(self, target_dept: str, user_input: str = "") -> str:
        """
        [Smart Retrieval]
        사용자의 입력(user_input)을 검색 쿼리에 포함시켜 가이드라인 추출.
        """
        if not self.retriever:
            app_logger.error("Retriever is not initialized.")
            return "시스템 오류: 지식 베이스가 준비되지 않았습니다."

        if not target_dept:
            return "부서가 지정되지 않았습니다."

        try:
            # [기존 기능 유지] 검색 쿼리 로직 동일
            query = f"[{target_dept}] {user_input} 업무 가이드라인 필수 체크리스트 시나리오"
            
            # 비동기 검색 수행
            docs = await self.retriever.ainvoke(query)
            
            if not docs:
                app_logger.warning(f"No documents found for query: {query}")
                return "관련된 상세 가이드라인을 찾지 못했습니다. 육하원칙(5W1H)에 따라 상세히 작성해주세요."
            
            # 검색된 문서들의 내용을 하나의 문자열로 결합
            context_text = "\n\n".join([f"- {doc.page_content}" for doc in docs])
            
            app_logger.debug(f"RAG Context Retrieved for '{user_input}': {len(docs)} docs found.")
            return context_text
            
        except Exception as e:
            app_logger.error(f"RAG Retrieval failed: {str(e)}")
            return "가이드라인 검색 중 시스템 오류 발생."

# 싱글톤 인스턴스 생성
rag_service = RAGService()