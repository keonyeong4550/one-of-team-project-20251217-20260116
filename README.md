# one-of-team-project-20251217-20260116
---
# 1.프로젝트 개발 방식 정리
## 가. AS-IS (현재 개발 방식 분석)
### 개발 방식 요약
- **하이브리드 방식** (애자일 + 워터폴 혼합)
- 마감일 고정형 프로젝트 + 내부 진행은 반복적 개선 구조
### 특징
- 요구사항이 회의마다 조정됨 (기능/범위 유동적)
- 역할 분담 후 병렬 개발 진행
- 기능 완성 기준은 비교적 단순함 ("에러 없이 동작")
- 일정 말미에 기능을 수렴하는 구조
### 문제점
- 명확한 스프린트 단위 목표 부재
- 우선순위가 회의 중 변경되어 개발 집중도 저하 가능
- 테스트/완료 기준(DoD)이 모호함
## 나. TO-BE (추천 개발 방식)
### 추천 모델
- **Fixed Deadline 기반 Agile (Sprint 중심 개발)**
### 전체 구조
- 총 개발 기간을 **1주 단위 스프린트**로 분할
- 각 스프린트마다:
  - 목표 기능 명확화
  - 데모 가능한 결과물 산출
  - 간단한 회고 진행
## 다. Sprint 운영안 (예시)
### Sprint 구성 (1주)
- **Day 1**: 백로그 정리 / 우선순위 결정
- **Day 2~4**: 개발
- **Day 5**: 통합 테스트 + 데모
### 산출물
- 동작 가능한 기능
- 간단한 기능 설명 문서
## 라. 역할 분담 기준 (유지)
| 영역        | 담당 내용            |
|:----|:----:|
| 게시판       | CRUD, 권한 처리   |
| 파일 처리     | 업로드/다운로드    |
| AI           | 프롬프트, API 연동 |
## 마. Definition of Done (DoD) 제안
- 기능 단위로 에러 없이 동작
- 더미 데이터 기준 시나리오 통과
- 다른 파트와 연동 가능
## 바. 기대 효과
- 일정 압박 감소
- 개발 집중도 향상
- 발표/제출 시 리스크 최소화
---
# 2. 개발문서표준체계
<img width="2481" height="3508" alt="Image" src="https://github.com/user-attachments/assets/2c8a2722-9250-47c7-bc65-0d134ddcd4c4" />

---
# 3. 화면설계서 제작(2025-12-18-2025-12-19)
![Image](https://github.com/user-attachments/assets/355d9050-54f8-416b-833a-6c9a78f7d028)
![Image](https://github.com/user-attachments/assets/c62eb678-e948-471e-8126-cca43d395a41)
![Image](https://github.com/user-attachments/assets/fcfa2919-0c2d-40de-8df9-c4a107ba41bd)
![Image](https://github.com/user-attachments/assets/6bc93fee-48f7-42fe-ad57-d3f047edbfa6)
![Image](https://github.com/user-attachments/assets/5fd4222e-1ee4-48a6-8c20-b95a6979d284)
![Image](https://github.com/user-attachments/assets/96920aa0-eff0-4760-93fa-64f6311fb4df)
![Image](https://github.com/user-attachments/assets/dfc7c6b9-f55b-4de4-95fc-973f51298618)
![Image](https://github.com/user-attachments/assets/db528175-d324-4a2c-8742-46e3f59f2142)
![Image](https://github.com/user-attachments/assets/ddcf7288-6301-456e-9b1b-43bfe1325c88)
![Image](https://github.com/user-attachments/assets/37f4c20e-b34a-4023-b645-d86743a8fc5c)
![Image](https://github.com/user-attachments/assets/0a5677d8-4f56-4a47-a0a1-f35a05c5072c)
![Image](https://github.com/user-attachments/assets/761834e1-47ee-4e78-aa5d-4b5b6db8ce42)
![Image](https://github.com/user-attachments/assets/ee440156-d576-45dd-8ccc-ee7f6e61c17e)
![Image](https://github.com/user-attachments/assets/c2db339f-0efd-4fcb-acca-929083bf6c8e)
![Image](https://github.com/user-attachments/assets/4c3a83f7-dc08-4348-a681-e1764652b6ac)
