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
- 폴백 순서: API 키 → 로컬 CLI → 미리 만든 데모 응답(실제 응답과 같은 형식).
  - 로컬 CLI: `[shutil.which("claude"), "-p", "--model", CLAUDE_MODEL, "--output-format", "json", "--max-turns", "1"]`, 프롬프트는 stdin으로 넘긴다(긴 입력도 됨). cwd는 임시 폴더, 타임아웃 120초. JSON의 `result`가 답, `total_cost_usd`가 실제 원가다. 종료 코드가 0이 아니거나, JSON이 깨졌거나, `is_error`가 true면(사용량 한도·인증 오류도 종료 코드 0에 `is_error: true`로 온다) 실패로 보고 다음 폴백으로 간다. `result`를 그대로 화면에 내보내지 않는다. 로컬에서만 된다: railway에서는 데모 응답만 나오므로, 키가 없으면 공개 링크는 로컬 서버를 cloudflared로 연다.
  - 한 번에 10초 넘는 호출은 항목별로 쪼개 병렬(최대 4개)로 부르고, 끝난 항목부터 화면에 띄운다.
- AI 깊이: M1은 호출 2단계 이상의 파이프라인이다(예: 추출 → 검증·근거 대조 → 생성). 단계마다 이름, 입력 요약, 출력, 소요 시간을 화면에 보인다. 미션이 에이전트를 요구하면 단계를 각각 에이전트로 이름 붙인다.
- 숫자: 금액·점수 같은 계산은 AI가 아니라 서버의 고정 규칙·표로 한다(같은 입력이면 같은 숫자). AI는 근거와 분류만 낸다. 데모용 고정 입력 1개를 시드로 둔다.
- 같은 입력 캐시(memo)를 두면 적중했을 때도 `source`는 원래 값, `cached: true`, `latency_ms`는 원래 호출 시간을 넣는다. 화면 시간 표시는 원래 호출 시간을 쓴다.
- AI 응답 JSON에 `source`(api|cli|demo), `cached`(true|false), `latency_ms`, `cost_usd`를 넣는다. 화면에는 "cache", "fallback", source 같은 표시를 하지 않는다(지연 시간은 보여도 된다). 매 호출을 서버 로그에 한 줄로 남긴다.

산출물(새 파일은 Write, 기존 파일은 바뀐 곳만 Edit):
1. docs/architecture.md: 맨 위 `## 설정`(BACKEND_PORT, FRONTEND_PORT, CLAUDE_MODEL 기본값, 환경 변수 이름), AI 호출 지점(기능 ID)·프롬프트·폴백 데이터 위치, 구성 요소, 디렉터리 구조, 데이터 모델, 화면 목록과 흐름, 외부 서비스, 환경 변수 이름. 기능 ID와 구성 요소를 연결한다.
2. docs/api.md: 엔드포인트마다 메서드, 경로, 요청·응답 JSON 예시, 에러 형태, 기능 ID. 백엔드와 프런트엔드 builder가 이 문서만 보고 따로 일할 수 있어야 한다.
3. docs/adr/NNN-<slug>.md(기존 최대 번호 + 1, 처음은 001): 되돌리기 어렵고, 맥락 없이 보면 의아하고, 실제 대안이 있던 결정만. 제목과 1~3문장(맥락, 결정, 이유).
4. docs/index.md에 링크를 추가한다.
```
