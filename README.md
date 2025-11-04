# 🎓 {팀 1}

> 코드잇 노드 백엔드 6기
> 백엔드 초급 프로젝트 : SEVEN
> 내용 템플릿만 가져옴 (수정 중)

📎 **팀 협업 문서:** [링크 게시 예정]

---

## 👥 팀원 구성

| 이름   | 역할                                 | Github                            |
| ------ | ------------------------------------ | --------------------------------- |
| 이호성 | 소셜 로그인 / 회원 추가 정보 API     | [웨인 Github](개인 Github 링크)   |
| 김지선 | 권한 관리 / 반응형 레이아웃 API      | [제이든 Github](개인 Github 링크) |
| 나영준 | 수강생 정보 관리 / 공용 Button API   | [마크 Github](개인 Github 링크)   |
| 이상휘 | 관리자 API / 회원관리 슬라이더       | [데이지 Github](개인 Github 링크) |
| 이지민 | 학생 시간 정보 관리 / 공용 Modal API | [제이 Github](개인 Github 링크)   |
| 정동원 | 학생 시간 정보 관리 / 공용 Modal API | [제이 Github](개인 Github 링크)   |

---

## 🧩 프로젝트 소개

**목표:**  
프로그래밍 교육 사이트의 **백엔드 시스템 구축**을 통해 회원 관리, 권한 제어, 강의 정보 관리 등 핵심 기능을 구현합니다.

**주요 기능:**

- 소셜 로그인 (Google OAuth)
- 회원 권한별 접근 제어
- 수강생 및 관리자 정보 관리
- 실시간 접속 및 시간 정보 관리

---

## 🛠️ 기술 스택

| 구분          | 기술                   |
| ------------- | ---------------------- |
| **Backend**   | Express.js, Prisma ORM |
| **Database**  | MongoDB                |
| **공통 Tool** | Git & Github, Discord  |

---

## 🧑‍💻 팀원별 구현 기능

### 웨인

> ![웨인 작업 이미지](첨부 이미지 또는 gif 파일 경로)

- **소셜 로그인 API**
  - Google OAuth 2.0 기반 로그인 기능 구현
  - 로그인 후 추가 정보 입력을 위한 API 엔드포인트 개발
- **회원 추가 정보 입력 API**
  - 회원 유형(관리자 / 학생)에 따른 조건부 입력 처리 API 구현

---

### 제이든

> ![제이든 작업 이미지](첨부 이미지 또는 gif 파일 경로)

- **회원별 권한 관리**
  - 사용자 역할(Role)에 따라 접근 권한 설정 API 구현
  - 관리자/일반 사용자 페이지용 조건부 라우팅 기능 추가
- **반응형 레이아웃 API**
  - 클라이언트 요청에 맞춰 레이아웃 데이터 제공 API 개발

---

### 마크

> ![마크 작업 이미지](첨부 이미지 또는 gif 파일 경로)

- **수강생 정보 관리 API**
  - `fetch(GET)`으로 수강생 정보 조회 API 구현
  - 반응형 UI 데이터 구성
- **공용 Button API**
  - 공통 버튼 액션을 처리하는 API 개발

---

### 데이지

> ![데이지 작업 이미지](첨부 이미지 또는 gif 파일 경로)

- **관리자 API**
  - Path Parameter를 이용한 동적 라우팅 구현
  - `fetch(PATCH, DELETE)`를 통한 학생 정보 수정 및 탈퇴 처리
- **CRUD 기능**
  - 학생 정보 생성·조회·수정·삭제 API 구축
- **회원관리 슬라이더**
  - carousel 방식으로 학생 목록 제공 API 구현

---

### 제이

> ![제이 작업 이미지](첨부 이미지 또는 gif 파일 경로)

- **학생 시간 정보 관리 API**
  - 학생별 시간 정보 조회 API 구현
  - `fetch(GET)`으로 실시간 접속 현황 관리
- **수정 및 탈퇴 API**
  - `fetch(PATCH, DELETE)`로 개인정보 수정 및 탈퇴 처리
- **공용 Modal API**
  - 공통 Modal 기능 처리 API 개발

---

## 📁 프로젝트 구조

project/
┣ src/
┃ ┣ config/
┃ ┃ ┗ db.ts
┃ ┣ controllers/
┃ ┃ ┣ auth.controller.ts
┃ ┃ ┗ user.controller.ts
┃ ┣ middleware/
┃ ┃ ┣ auth.middleware.ts
┃ ┃ ┗ error.middleware.ts
┃ ┣ models/
┃ ┃ ┣ user.model.ts
┃ ┃ ┗ course.model.ts
┃ ┣ routes/
┃ ┃ ┣ auth.routes.ts
┃ ┃ ┗ user.routes.ts
┃ ┣ services/
┃ ┃ ┣ auth.service.ts
┃ ┃ ┗ user.service.ts
┃ ┣ utils/
┃ ┃ ┣ jwt.ts
┃ ┃ ┣ constants.ts
┃ ┃ ┗ logger.ts
┃ ┣ app.ts
┃ ┗ server.ts
┣ prisma/
┃ ┣ schema.prisma
┃ ┗ seed.ts
┣ .env
┣ .gitignore
┣ package.json
┣ tsconfig.json
┗ README.md

---

## 🌐 구현 홈페이지

[https://www.codeit.kr/](https://www.codeit.kr/)

---

## 🧠 프로젝트 회고록

> 발표자료 및 회고록 링크: (제작한 발표자료 링크 또는 첨부)

---

📌 **작성일:** 2025-11-03  
📌 **작성자:** nb6기 Team1
