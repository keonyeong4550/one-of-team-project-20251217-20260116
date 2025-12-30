import os
import sys

print("--------------------------------------------------")
print(f"[1] 현재 실행 위치: {os.getcwd()}")
print("--------------------------------------------------")

# 1. app 폴더 확인
if not os.path.exists("app"):
    print("❌ 'app' 폴더가 없습니다!")
else:
    print("✅ 'app' 폴더 발견됨.")
    print(f"   내부 파일 목록: {os.listdir('app')}")

# 2. app/services 폴더 확인
services_path = os.path.join("app", "services")
if not os.path.exists(services_path):
    print("❌ 'app/services' 폴더가 없습니다! (스펠링 확인하세요)")
else:
    print("✅ 'app/services' 폴더 발견됨.")
    files = os.listdir(services_path)
    print(f"   내부 파일 목록: {files}")
    
    # __init__ 파일 정밀 검사
    if "__init__.py" in files:
        print("   ✅ __init__.py 존재함")
    else:
        print("   ❌ __init__.py 없음! (혹시 __init__.py.txt 인가요?)")
        
    # agent_core 파일 정밀 검사
    if "agent_core.py" in files:
        print("   ✅ agent_core.py 존재함")
    else:
        print("   ❌ agent_core.py 없음! (스펠링/확장자 확인)")

print("--------------------------------------------------")
print("[3] 파이썬 임포트 테스트 시도")

try:
    import app.services
    print("✅ 'import app.services' 성공")
except ImportError as e:
    print(f"❌ 'import app.services' 실패: {e}")

try:
    from app.services import agent_core
    print("✅ 'from app.services import agent_core' 성공")
except ImportError as e:
    print(f"❌ 임포트 에러 발생: {e}")