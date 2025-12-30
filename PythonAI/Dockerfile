# 1. 베이스 이미지 설정 (Python 3.11 Slim 버전 사용 - 가볍고 빠름)
FROM python:3.11-slim

# 2. 환경 변수 설정
# PYTHONDONTWRITEBYTECODE: 파이썬 .pyc 파일 생성 방지
# PYTHONUNBUFFERED: 로그가 버퍼링 없이 즉시 콘솔에 출력되도록 설정 (디버깅 필수)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENV=prod

# 3. 작업 디렉토리 생성
WORKDIR /app

# 4. 시스템 의존성 설치
# ChromaDB나 일부 라이브러리는 빌드 시 C++ 컴파일러가 필요할 수 있음
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc g++ build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 5. 파이썬 의존성 파일 복사 및 설치
# requirements.txt만 먼저 복사해서 캐싱을 활용 (코드 수정돼도 라이브러리 다시 설치 안 함)
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 6. 소스 코드 전체 복사
COPY . .

# 7. 포트 노출 (FastAPI 기본 포트)
EXPOSE 8000

# 8. 실행 명령 (Uvicorn 서버 구동)
# 0.0.0.0으로 열어야 컨테이너 외부에서 접속 가능
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]