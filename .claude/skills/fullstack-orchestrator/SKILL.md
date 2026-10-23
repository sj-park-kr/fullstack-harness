---
name: fullstack-orchestrator
description: "docs/plan.md의 로컬 이슈 티켓(.scratch/build/issues/)을 차례로 실행한다: builder 구현, 단계마다 qa, 배포. '구현 시작', '다음 단계', '백엔드만 다시', '배포' 같은 요청에 사용한다. 파이프라인 4단계."
---

# 풀스택 오케스트레이터

메인은 조율만 한다. 탐색·구현·검증은 서브에이전트에 맡긴다. 서브에이전트를 띄울 수 없으면 메인이 그 에이전트 파일 지침을 그대로 따라 직접 한다. 모델은 에이전트 파일에 고정돼 있으니 `model`을 넘기지 않는다.

## 규칙
- 독립 작업은 한 메시지에서 병렬로 호출한다. 맡긴 일을 메인이 다시 하지 않는다.
- 서브에이전트는 대화를 모른다. 프롬프트에 단계 목표, 그 행의 할 일, 담당 디렉터리(밖은 고치지 말 것), `docs/api.md`·`docs/architecture.md` 경로, 완료 조건, 사용자가 지정한 스킬 지침을 넣는다.
- 단계 = 티켓 파일 `.scratch/build/issues/NN-*.md` 하나다. `docs/plan.md`는 고정 결정과 `배포:`만 읽는다. 메인은 `docs/` 문서와 티켓 본문을 고치지 않는다(`**Status:**` 줄과 `## Comments` 추가만 예외).
- 다음 티켓: Grep `^\**Status:`로(굵게 표시가 있든 없든, mp 스킬이 쓴 티켓 포함) `ready-for-agent`이면서 `**Blocked by:**`의 티켓이 모두 `resolved`인 것 중 가장 작은 번호. 시작할 때 `claimed`로 바꾼다.
- 긴 결과는 `_workspace/phaseN_<에이전트>_<내용>.md`에 남기게 하고 요약만 받는다.
- 서버는 `python .claude/skills/webapp-testing/scripts/with_server.py --server "<명령>" --port <포트> -- <검사 명령>`으로만 띄우고 끈다(스크립트가 자기가 띄운 프로세스 트리만 끈다). `Stop-Process`, `taskkill /IM`, 이름·포트로 찾아 죽이기는 금지. 이 규칙을 builder·qa 프롬프트에 넣는다.

## 시간
- 단계를 시작할 때마다 현재 시각을 확인한다(`date +%H:%M`).
- 한 단계가 40분을 넘기면 사용자에게 범위를 줄일지 묻는다. Nice를 먼저 버리고, 다음으로 Must 완료 기준을 줄인다.
- 13:15 기능 동결: 새 단계를 시작하지 않는다. 남은 티켓은 `**Status:** wontfix`로 바꾸고 "배포"의 최종 배포로 간다.

## 절차
0. 사전 점검(첫 실행 1회, 결과는 `_workspace/preflight.md`, 사용자에게 한 줄 보고):
   - Python Playwright: `python -c "import playwright"`. 안 되면 `python -m venv _workspace/.venv` 후 그 pip로 설치하고 그 python을 쓴다. chromium이 안 뜨면 `channel="msedge"`.
   - `node -v`, `npm -v`.
   - ANTHROPIC_API_KEY 설정 여부만 `set`/`missing`으로 적는다(값은 출력하지 않는다). missing이면 `claude --version`으로 로컬 CLI를 확인하고, 그것도 없으면 데모 응답으로 진행한다고 알린다. 기대하는 `source`(api|cli|demo)를 적는다.
   - BACKEND_PORT, FRONTEND_PORT(`docs/architecture.md`)가 비어 있는지 소켓 연결로 확인한다. 차 있으면 빈 포트를 골라 환경 변수로 넘기고 적는다. 점유 프로세스는 끄지 않는다.
   - 배포 모드(`docs/plan.md`의 `배포:`).
   - Windows 긴 경로: `reg query HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled`가 0x0이면 레포 경로 길이(글자 수)와 함께 사용자에게 알린다(켜려면 관리자 권한이 필요하니 사용자가 한다). 설치 실패 시 레포 밖으로 옮겨 우회하지 않는다.
   `docs/plan.md`나 `.scratch/build/issues/`가 없으면 `/prd` → `/design` → `/build-plan`을 안내하고 멈춘다. `claimed`로 남은 티켓(중단된 것)이 있으면 그것부터, 없으면 다음 티켓부터 진행하고, 남은 티켓이 없으면 최종 배포로 간다. 일부만 다시 해 달라면 해당 에이전트만 부른다.
1. 티켓에서 What to build(목표, 기능,  실행: 병렬/순차), builder 표, 완료 조건을 읽는다. 병렬인데 담당 디렉터리가 겹치면 멈추고 알린다.
2. 표의 행마다 `builder` 하나. 병렬이면 한 메시지에서 동시에, 순차면 표 순서대로 앞 결과를 받은 뒤 호출한다.
3. 모두 끝나면 `qa`에 완료 조건을 그대로 넘긴다. 실패하면 재현 단계를 붙여 해당 builder에 수정을 맡기고 다시 `qa`. 통과하면 qa 스크린샷(`_workspace/qa/*.png`)을 `../planning-harness/plan/shots/`로 복사하고(없으면 만든다, 같은 이름은 덮어쓴다. 기획 폴더가 없으면 건너뛴다. 중간에 멈춰도 `/judge-review` 입력이 있게 한다), `**Status:** resolved`로 바꾸고 `## Comments`에 시각과 qa 결과 한 줄을 붙인 뒤 한 줄 보고한다. 실패 재현 단계도 같은 곳에 붙인다.
4. `배포: railway`면 티켓 01 통과 직후 첫 배포를 한다. 배포 문제는 일찍 찾는다.

## 배포 (`docs/plan.md`의 `배포:`)
설계상 FastAPI 하나가 프런트(dist)와 API를 같이 낸다.
- railway: 첫 배포 전 사용자에게 직접 실행하게 한다(대화형): `npm i -g @railway/cli`, `railway login`, `railway init`. 비밀 환경 변수는 사용자가 Railway 대시보드에 넣는다.
- 배포: `railway up --detach`. 첫 배포 뒤 `railway domain`으로 공개 URL을 만들고 사용자에게 알린다.
- 실패하면 `railway logs` 요약을 `scout`에 맡기고 해당 builder에 고치게 한다.
- cloudflared(또는 railway가 13:40까지 안 될 때): `frontend`에서 `npm run build` 후, 사용자에게 터미널 두 개에서 직접 실행하게 한다: `backend`에서 uvicorn(`--port <BACKEND_PORT>`), `cloudflared tunnel --url http://localhost:<BACKEND_PORT>`(계정 불필요). 노트북이 잠들거나 꺼지면 링크가 죽는다고 알린다.
- local: 배포하지 않는다. 최종 점검은 with_server로 localhost에서 한다.
- 최종 배포: 배포 → `qa`가 공개 URL(local이면 localhost)에서 데모 시나리오 전체를 Playwright로 점검하고 화면마다 스크린샷 → 스크린샷을 `../planning-harness/plan/shots/`로 복사(없으면 만든다, `/judge-review` 입력. 기획 폴더가 없으면 `_workspace/shots/`에 두고 알린다) → URL과 남은 위험을 보고한다. 13:45 이후 코드 변경은 사용자 승인 후에만 한다.

## 오류 처리
- 에이전트가 실패하면 한 번 다시 시도한다. 또 실패하면 사용자에게 알리고 진행한다.
- builder가 같은 버그를 두 번 못 고치면 `architect`에 넘긴다(에러 메시지, 시도한 내용, 사용자가 지정했으면 `/systematic-debugging` 지침).
- 사용량 한도, 인증 만료, 권한 거부는 다시 시도하지 않고 진행 상황을 보고한다.
