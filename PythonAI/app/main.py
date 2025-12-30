from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logger import app_logger
from app.api.v1.endpoints import router as api_v1_router

# 앱 초기화
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise AI Mediator Service for Cross-Department Workflow",
    version="1.0.0",
    docs_url="/docs", 
    redoc_url="/redoc"
)

# [보안 수정] CORS 설정 강화
# 기존: allow_origins=["*"] (누구나 접속 가능)
# 변경: 자바 서버와 로컬 개발 환경에서만 접근 허용
origins = [
    "http://localhost:3000", # (선택) 개발 중 프론트엔드 직접 디버깅 필요 시 유지, 배포 시 제거 권장
    "http://localhost:8080", # Java Backend (Local)
    "http://host.docker.internal:8080", # Java Backend (Docker)
    "http://127.0.0.1:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # 구체적인 출처만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    app_logger.info("Starting up AI Bridge Service...")

@app.on_event("shutdown")
async def shutdown_event():
    app_logger.info("Shutting down AI Bridge Service...")

if __name__ == "__main__":
    import uvicorn
    # 보안상 로컬에서만 접근 가능하도록 127.0.0.1 권장되나, Docker 환경 고려하여 0.0.0.0 유지
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)