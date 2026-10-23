---
name: design
description: "docs/prd.md를 기준으로 architect에 설계를 맡겨 docs/architecture.md, docs/api.md, docs/adr/를 만들거나 고친다. 파이프라인 2단계이며 다음은 /build-plan이다."
license: ADR 형식 일부는 Matt Pocock의 domain-modeling/ADR-FORMAT.md(MIT)에서 가져왔다. LICENSE.txt 참고
---

# 설계

메인 세션은 확인과 위임만 한다.

## 절차
1. `docs/prd.md`가 없으면 `/prd`를 안내하고 멈춘다.
2. `backend/`나 `frontend/`가 이미 있으면 아래 스택과 맞는지 `scout`에 확인을 맡긴다.
3. `architect`를 한 번 호출한다. 프롬프트는 아래 그대로 쓰고, scout 결과와 사용자가 지정한 스킬 지침을 덧붙인다.
4. 요약과 경로를 전하고 `/build-plan`을 안내한다. 수정 요청이면 바뀐 부분만 고치라고 다시 맡긴다.

## 위임 프롬프트

```
docs/prd.md와 거기 링크된 requirements.md를 읽고 설계 문서를 쓴다(prd.md의 범위 조정이 우선). Must 기능과 데모 시나리오만 설계하고, Nice는 확장 지점만 한 줄로 적는다.
requirements.md 화면 표에 목업이 있으면 화면 구성과 문구를 목업에 맞춘다.

스택(실제 파일과 다르면 실제를 따르고 ADR에 적는다):
- backend/: FastAPI, backend/app/main.py의 app, backend/requirements.txt, 가상환경 backend/.venv. 모든 API는 /api 아래.
- 포트: docs/architecture.md `## 설정`에 BACKEND_PORT(기본 8000), FRONTEND_PORT(기본 5173)를 한 번만 정한다. 코드는 환경 변수를 먼저 읽고 없으면 이 기본값을 쓴다. 다른 문서와 명령은 숫자 대신 이름을 쓴다.
- frontend/: React + Vite(npm run dev, server.port = FRONTEND_PORT). API는 상대 경로 /api로 부르고, vite.config의 server.proxy로 /api를 http://localhost:<BACKEND_PORT>에 넘긴다(process.env에서 읽기).
- 배포: 서비스 1개. FastAPI가 API 라우트 다음에 frontend/dist를 StaticFiles(html=True)로 "/"에 마운트한다. dist 경로는 main.py 기준으로 잡아 로컬과 이미지에서 모두 맞게 하고, 폴더가 없으면(개발 중) 마운트를 건너뛴다. 루트 Dockerfile: node로 frontend 빌드 → python 이미지에서 uvicorn app.main:app --host 0.0.0.0 --port $PORT. Dockerfile은 docs/plan.md `배포: railway`일 때만 만든다. 새로고침 404를 피하려고 URL 경로 라우팅 대신 화면 상태로 전환한다.
- 데이터: 메모리나 SQLite 파일과 시드 데이터. 로그인은 빼거나 데모 계정.
- AI: Claude API는 backend에서만 `anthropic` SDK로 부른다. 키는 환경 변수 ANTHROPIC_API_KEY(.env 파일은 읽지 않는다, .env.example에 이름만), 모델은 환경 변수 CLAUDE_MODEL, 기본 claude-sonnet-5-5. 타임아웃 20초.
- 폴백 순서: API 키 → 로컬 `claude -p "<짧은 프롬프트>" --max-turns 1`(subprocess, 실행 파일은 `shutil.which("claude")`, cwd는 임시 폴더, 타임아웃 60초) → 미리 만든 데모 응답(실제 응답과 같은 형식). 로컬 CLI는 로컬에서만 된다(railway 불가). 호출마다 수 초 걸리니 화면에 로딩 상태를 둔다. 화면은 같은 UI로 보여 주고 "cache", "rules mode", "fallback" 같은 표시를 하지 않는다. 폴백 여부는 서버 로그에만 남긴다.

산출물(새 파일은 Write, 기존 파일은 바뀐 곳만 Edit):
1. docs/architecture.md: 맨 위 `## 설정`(BACKEND_PORT, FRONTEND_PORT, CLAUDE_MODEL 기본값, 환경 변수 이름), AI 호출 지점(기능 ID)·프롬프트·폴백 데이터 위치, 구성 요소, 디렉터리 구조, 데이터 모델, 화면 목록과 흐름, 외부 서비스, 환경 변수 이름. 기능 ID와 구성 요소를 연결한다.
2. docs/api.md: 엔드포인트마다 메서드, 경로, 요청·응답 JSON 예시, 에러 형태, 기능 ID. 백엔드와 프런트엔드 builder가 이 문서만 보고 따로 일할 수 있어야 한다.
3. docs/adr/NNN-<slug>.md(기존 최대 번호 + 1, 처음은 001): 되돌리기 어렵고, 맥락 없이 보면 의아하고, 실제 대안이 있던 결정만. 제목과 1~3문장(맥락, 결정, 이유).
4. docs/index.md에 링크를 추가한다.
```
