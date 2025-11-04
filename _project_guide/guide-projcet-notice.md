# [SEVEN] 안내

초급 프로젝트 **SEVEN**에 대해서 안내드립니다.

# 개요

- 제목: SEVEN
- 소개: 운동 인증 커뮤니티 서비스
- 난이도: 초급
- 디자인 시안:
  - [SEVEN[AAA] 운동 인증 커뮤니티 서비스](https://www.figma.com/design/VkyPpSWUisM1LfTcwttDHe/SEVEN%5BAAA%5D-%EC%9A%B4%EB%8F%99-%EC%9D%B8%EC%A6%9D-%EC%BB%A4%EB%AE%A4%EB%8B%88%ED%8B%B0-%EC%84%9C%EB%B9%84%EC%8A%A4?node-id=260-538&t=DAnnYmwlNRs9t8Vz-1)
  - 요구 사항 이해를 돕기 위한 Figma 디자인입니다.
- 프론트엔드 예시 링크:
  - [https://nb-project-seven-fe.vercel.app/](https://nb-project-seven-fe.vercel.app/)
  - 요구 사항 이해를 돕기 위한 사이트입니다. (서버 속도가 느릴 수 있음)
- 프론트엔드 코드 (최종 수정 2025. 08. 29.)
  [project-seven-fe-main.zip](project-seven-fe-main.zip)
  - “API 명세서”에 있는 내용을 기준으로 구현된 프론트엔드 코드입니다.
  - API 설계를 수정해서 쓰고 싶다면, `README.md` 파일에 적혀있는 내용을 참고해 주세요.

# 기능 요구 사항

### 그룹

**그룹 등록**

- 그룹명, 설명, 닉네임, 비밀번호, 사진(한 장), 태그, 목표 횟수, 디스코드 웹훅 URL, 디스코드 서버 초대 URL을 입력하여 그룹을 등록합니다.

**그룹 수정**

- 비밀번호를 입력하여 그룹 등록 시 입력했던 비밀번호와 일치할 경우 그룹 수정이 가능합니다.

**그룹 삭제**

- 비밀번호를 입력하여 그룹 등록 시 입력했던 비밀번호와 일치할 경우 그룹 삭제가 가능합니다.

**그룹 목록 조회**

- 각 그룹의 그룹명, 닉네임, 사진, 태그, 목표 횟수, 추천수, 참여자수가 표시됩니다.
- 페이지네이션이 가능합니다.
- 최신순, 추천순, 참여자순으로 정렬이 가능합니다.
- 그룹명으로 검색이 가능합니다.

**그룹 상세 조회**

- 그룹명, 설명, 닉네임, 사진, 태그, 목표 횟수, 참여자 수, 디스코드 서버 초대 URL을 조회합니다.

**그룹 추천**

- 그룹 추천이 호출될 때마다 추천수가 1씩 증가합니다.

**그룹 배지**

- 그룹이 일정 조건을 달성하면 자동으로 배지를 획득합니다.
- 배지의 종류
  - 참여자 10명 이상
  - 운동 기록 100개 이상
  - 추천수 100 이상

**그룹 참여**

- 닉네임과 비밀번호를 입력하여 그룹에 참여가 가능합니다.
  - 그룹 내에서 중복된 닉네임은 등록 불가합니다.
- 비밀번호 인증을 통해 그룹 참여 취소가 가능하며, 참여를 취소하면 해당 닉네임이 생성한 운동 기록은 모두 삭제됩니다.

### 운동 기록

**기록 등록**

- 닉네임, 운동 종류(달리기, 자전거, 수영), 설명, 시간, 거리, 사진(최대 3장까지 가능), 비밀번호를 입력하여 운동 기록을 등록합니다.
- 타이머를 통해 측정된 실제 운동한 만큼의 시간만 입력 가능합니다.
- 닉네임, 비밀번호를 확인하여 그룹에 등록된 유저일 때만 기록 등록이 가능합니다.
- 새로운 운동 기록이 등록 되었을 때 그룹에 등록된 디스코드 웹 서버로 알림을 전송합니다.

**기록 목록 조회**

- 그룹 내에 등록된 모든 유저의 운동 기록 조회가 가능합니다.
- 닉네임, 운동 종류, 시간, 거리, 사진이 표시됩니다.
- 최신순, 운동시간순으로 정렬 가능합니다.
- 닉네임으로 검색 가능합니다.
- 페이지네이션이 가능합니다.

**기록 랭킹 조회**

- 운동 기록 많은 순으로 주간, 월간 랭킹 조회가 가능합니다.
- 닉네임, 기록 횟수, 누적 시간 조회가 가능합니다.
- ~~페이지네이션이 가능합니다.~~

**기록 상세 조회**

- 운동 종류, 설명, 사진(여러장), 시간, 거리, 닉네임 조회가 가능합니다.

# 심화 요구 사항

### 객체 지향 프로그래밍 적용

- Router 코드와 Request Handler 함수에 해당하는 코드를 분리합니다.
- Request Handler에 해당하는 코드들을 모아서, Controller라는 클래스를 구현합니다.
- Controller 클래스의 함수를 Router에서 등록합니다.

### 일관된 에러처리 구현

- Express.js의 Global Error Handler를 구현합니다.
- 개별 Request Handler에서 에러가 발생하는 경우, Global Error Handler에서 처리하도록 구현합니다.

### ORM에서 select 고급 활용

- 그룹 목록 조회에서 참여자의 수를 리스폰스로 전달하는 경우처럼 연결된 모델의 개수가 필요한 경우, 하나의 `findMany()` 메서드 안에서 처리할 수 있도록 구현합니다.
- Prisma 공식 문서의 [Filter the relation count](https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing#filter-the-relation-count)를 참고하세요.

# 참고

### API 명세서

# 그룹 (5개)

1. POST /groups
2. GET /groups
3. GET /groups/{groupId}
4. PATCH /groups/{groupId}
5. DELETE /groups/{groupId}

# 참여자 (2개)

6. POST /groups/{groupId}/participants
7. DELETE /groups/{groupId}/participants

# 운동 기록 (3개)

8. POST /groups/{groupId}/records
9. GET /groups/{groupId}/records
10. GET /groups/{groupId}/records/{recordId}

# 좋아요 (2개)

11. POST /groups/{groupId}/likes
12. DELETE /groups/{groupId}/likes

# 이미지 (1개 - 필수 포함)

13. POST /images
