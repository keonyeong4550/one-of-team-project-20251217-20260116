import os
from llama_cpp import Llama

# 1. 경로 설정 (사용자님 에러 로그 기반으로 정확히 맞춤)
BASE_DIR = os.getcwd()
MODEL_PATH = os.path.join(BASE_DIR, "data", "models", "DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf")

print("--------------------------------------------------")
print(f"[진단 시작] 모델 경로 확인 중...")
print(f"👉 경로: {MODEL_PATH}")

# 2. 파일 존재 여부 확인
if not os.path.exists(MODEL_PATH):
    print("❌ [치명적 오류] 파일이 없습니다!")
    print("   확인할 사항:")
    print("   1. 'data' 폴더 안에 'models' 폴더가 있는지?")
    print("   2. 파일 이름이 정확한지? (확장자 .gguf 확인)")
    exit()
else:
    print("✅ 파일이 존재합니다.")

# 3. 파일 용량 확인
file_size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
print(f"📊 파일 크기: {file_size_mb:.2f} MB")

if file_size_mb < 100:
    print("❌ [치명적 오류] 파일 크기가 너무 작습니다! (가짜 파일)")
    print("   허깅페이스에서 '다운로드 버튼'을 그냥 클릭해서 다시 받으세요.")
    exit()

# 4. 로딩 테스트
print("⚙️ 모델 로딩 시도 중 (llama-cpp)...")
try:
    llm = Llama(
        model_path=MODEL_PATH,
        n_ctx=2048,
        verbose=True
    )
    print("✅ [성공] 모델이 정상적으로 로드되었습니다! 서버를 다시 켜보세요.")
except Exception as e:
    print(f"❌ [로딩 실패] 파일은 있는데 로드가 안 됩니다. 파일이 깨졌을 수 있습니다.")
    print(f"에러 메시지: {e}")