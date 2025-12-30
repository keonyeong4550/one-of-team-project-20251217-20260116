import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # 기본 앱 설정
    PROJECT_NAME: str = "AI Work Mediator (Local)"
    API_V1_STR: str = "/api/v1"
    ENV: str = Field("dev", pattern="^(dev|prod|test)$")
    
    # [Ollama Local 설정]
    # 팀 표준 모델 반영: qwen3:8b
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    MODEL_NAME: str = "qwen3:8b"
    EMBEDDING_MODEL_NAME: str = "nomic-embed-text"
    
    # 로컬 모델의 환각 방지를 위해 Temperature 0 유지
    TEMPERATURE: float = 0.0

    # Vector DB 설정
    CHROMA_PERSIST_DIRECTORY: str = "./data/chroma_db"
    
    # 보안 (기존 유지)
    BACKEND_API_KEY: str = Field(..., description="API Secret Key")
    JAVA_JWT_SECRET: str = "1234567890123456789012345678901234567890"

    # Database 설정 (Docker/Local 호환)
    DB_HOST: str = "host.docker.internal"
    DB_PORT: int = 3306
    DB_NAME: str = "aisdb"
    DB_USER: str = "aisdbuser"
    DB_PASSWORD: str = "aisdbuser"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()