import os
from langchain_community.vectorstores import Chroma
# [변경] GoogleGenerativeAIEmbeddings 제거 -> OllamaEmbeddings 적용
from langchain_community.embeddings import OllamaEmbeddings
from app.core.config import settings
from app.core.logger import app_logger

class VectorStoreManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VectorStoreManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """
        벡터 DB 초기화.
        기존 Google Gemini 임베딩을 제거하고, 로컬 Ollama(nomic-embed-text) 임베딩으로 전환합니다.
        ChromaDB의 데이터 영속성 기능(로컬 파일 저장)은 그대로 유지됩니다.
        """
        app_logger.info(f"Initializing Vector Store with Ollama ({settings.EMBEDDING_MODEL_NAME})...")
        
        try:
            # [변경] 로컬 임베딩 모델 설정
            # settings.OLLAMA_BASE_URL: http://localhost:11434
            # settings.EMBEDDING_MODEL_NAME: nomic-embed-text
            self.embedding_function = OllamaEmbeddings(
                base_url=settings.OLLAMA_BASE_URL,
                model=settings.EMBEDDING_MODEL_NAME
            )
            
            # 데이터가 저장될 경로가 없으면 생성 (기존 로직 유지)
            os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)

            # ChromaDB 인스턴스 생성 (기존 로직 유지)
            self.db = Chroma(
                persist_directory=settings.CHROMA_PERSIST_DIRECTORY,
                embedding_function=self.embedding_function
            )
            app_logger.info("Vector Store initialized successfully.")

        except Exception as e:
            # 임베딩 모델 연결 실패(Ollama 꺼짐 등) 시 치명적 오류 로그 기록
            app_logger.critical(f"Failed to initialize Vector Store: {str(e)}")
            # 앱 구동 자체를 멈추는 것보다, 일단 에러를 남기고 db 객체를 None으로 두어
            # 이후 get_retriever 호출 시 핸들링하도록 처리할 수도 있으나,
            # 여기서는 기존 구조에 맞춰 인스턴스 생성 흐름을 유지함.
            self.db = None

    def get_retriever(self, k: int = 3):
        """
        검색기(Retriever) 반환
        k: 검색할 문서의 개수
        [기존 기능 유지] RAG 서비스에서 호출하는 인터페이스 동일
        """
        if self.db is None:
            app_logger.error("Vector DB is not initialized. Cannot get retriever.")
            return None
            
        return self.db.as_retriever(search_kwargs={"k": k})

    def add_documents(self, documents):
        """
        문서 추가 (관리자 기능 및 초기 데이터 적재용)
        [기존 기능 유지] 데이터 추가 후 persist() 호출하여 파일로 저장
        """
        if self.db is None:
            app_logger.error("Vector DB is not initialized. Cannot add documents.")
            return

        self.db.add_documents(documents)
        self.db.persist()

# 전역 인스턴스
vector_store = VectorStoreManager()