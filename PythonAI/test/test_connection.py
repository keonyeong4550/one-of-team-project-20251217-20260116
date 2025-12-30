import requests
import json
import sys

JAVA_URL = "http://localhost:8080/api/tickets"
WRITER_ID = "AI_TEST_AGENT"

test_payload = {
    "title": "[시스템 점검] 연결 테스트 티켓",
    "content": "Python에서 Java로 전송되는 테스트 티켓입니다.",
    "purpose": "시스템 통합 테스트",
    "requirement": "응답 코드가 200 OK여야 함",
    "grade": "LOW",
    "deadline": "2025-12-31 09:00",
    "receivers": ["Manager_01", "Dev_Team"]
}

def check_java_connection():
    print(f"Connecting to Java Backend: {JAVA_URL}")
    
    try:
        response = requests.post(
            JAVA_URL,
            params={"writer": WRITER_ID},
            json=test_payload,
            headers={"Content-Type": "application/json"}
        )

        print("Status Code:", response.status_code)

        if response.status_code == 200:
            print("SUCCESS: Java Backend 연결 성공")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
            return True
        else:
            print("FAIL: 응답은 왔지만 에러")
            print(response.text)
            return False

    except requests.exceptions.ConnectionError:
        print("ERROR: Java 서버에 연결 불가 (8080 확인)")
        return False
    except Exception as e:
        print("ERROR:", str(e))
        return False

if __name__ == "__main__":
    check_java_connection()
