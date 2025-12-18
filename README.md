# one-of-team-project-20251217-20260116
---
# 1. 프로젝트 개발 방식 정리
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
# 3. 화면 설계서(2025-12-18-2025-12-19)
![Image](https://github.com/user-attachments/assets/eb4fae46-588f-4da9-b18f-affd90d2162f)
![Image](https://github.com/user-attachments/assets/e782d016-937f-4629-95c6-f5cbfe2d781a)
![Image](https://github.com/user-attachments/assets/e7a9fe70-defc-4033-b1ca-5f50b9538a6e)
![Image](https://github.com/user-attachments/assets/70960869-f69b-4359-9893-27bf89af07fc)
![Image](https://github.com/user-attachments/assets/b469c1ea-6bbf-416d-8f59-885bf6e4cf88)
![Image](https://github.com/user-attachments/assets/b18bbf78-5172-47e4-8378-9b703cb1cd24)
![Image](https://github.com/user-attachments/assets/55193bdc-c2c5-49cb-a30e-7a5b29e51952)
![Image](https://github.com/user-attachments/assets/41c9d5c9-709c-4b2a-91c7-71b7307d7a97)
![Image](https://github.com/user-attachments/assets/b22cb9da-6dd1-4dc4-957f-ae59531722cf)
![Image](https://github.com/user-attachments/assets/237182bf-d6ad-4146-af78-274098f4cd76)
![Image](https://github.com/user-attachments/assets/10aeb16e-351a-4fcc-84d5-90388b2edec9)
![Image](https://github.com/user-attachments/assets/5e11b203-a7d6-4c67-96f2-21ce33f3a8c0)
![Image](https://github.com/user-attachments/assets/f04ef54a-649d-4b63-a578-7136a429deff)
![Image](https://github.com/user-attachments/assets/89a59d65-0461-4f31-88eb-46bce84578e8)
![Image](https://github.com/user-attachments/assets/5c54247c-7ea6-4619-bfcf-25d82f447239)
---
# 4. 시스템 아키텍쳐(2025-12-18)
<img width="1040" height="720" alt="Image" src="https://github.com/user-attachments/assets/8fdbd6dc-7f0e-40f2-ba95-669d6b53cb87" />

---
# 5. DB 설계서 중 담당한 파일업로드 테이블정의서
<img width="3508" height="2481" alt="Image" src="https://github.com/user-attachments/assets/2539ac85-ca60-4118-b2de-cf3aa6eeee81" />
