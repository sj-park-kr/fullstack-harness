# fullstack-harness

AI 해커톤 구현용 Claude Code 하네스. 기획은 형제 폴더 [planning-harness](../planning-harness)가 맡는다.

## 기본 파이프라인 (이것만 순서대로)
```
/prd                      # ../planning-harness/plan/requirements.md → docs/prd.md
/design                   # → docs/architecture.md, api.md, adr/
/build-plan               # → docs/plan.md (단계, builder 배치, 배포 모드)
/fullstack-orchestrator   # 단계별 구현 → qa → 배포. "다음 단계", "배포"로 이어 간다
```
문제가 생겼을 때: `/systematic-debugging`(버그 원인), `/webapp-testing`(Playwright 점검). 행사 후: `/evolve`(회고 반영).

## 파이프라인 상세
| 순서 | 스킬 | 하는 일 | 산출물 |
| --- | --- | --- | --- |
| 1 | `/prd` | requirements.md를 링크하고, 결정·범위 조정만 덧붙인다 | `docs/prd.md` |
| 2 | `/design` | architect가 스택, 포트, Claude 호출 설정(키 없을 때 대체 경로 포함)을 정한다 | `docs/architecture.md`, `docs/api.md`, `docs/adr/` |
| 3 | `/build-plan` | 1단계 뼈대와 LLM 스모크 호출, 2단계 AI 핵심 순으로 수직 슬라이스를 나눈다 | `docs/plan.md` |
| 4 | `/fullstack-orchestrator` | 사전 점검 후 단계마다 builder 구현과 qa를 하고, 배포 모드(railway/cloudflared/local)대로 배포한다 | `backend/`, `frontend/`, 데모 URL, `../planning-harness/plan/shots/` |

## 행사 전 준비
- [ ] Node, Python 3.11+, `pip install playwright` 후 `playwright install chromium`
- [ ] 환경변수 `ANTHROPIC_API_KEY`를 설정하고, `CLAUDE_MODEL`(기본 `claude-sonnet-5-5`)로 실제 호출을 한 번 해 본다
- [ ] (선택) 배포: `npm i -g @railway/cli` 후 `railway login`. 대안은 `cloudflared`
- [ ] `backend/`와 `frontend/`를 만든 뒤 `.vscode/launch.json` 경로(`app.main:app`, `npm run dev`)가 맞는지 확인한다

## 추가 스킬 (필요할 때 직접 `/이름`)
기본 파이프라인에는 끼지 않는다. 모델이 스스로 부르지 않게 설정돼 있다. 예외는 `mp-grilling` 하나다(`/mp-grill-me`가 부르기 때문). 출처는 Matt Pocock [skills](https://github.com/mattpocock/skills)(MIT, `.claude/skills/LICENSE-mattpocock.txt`)이고, 모두 `mp-` 접두사를 붙여 설치한다. 최신으로 업데이트: `python .claude/scripts/update-mp-skills.py`(빼고 싶은 스킬은 스크립트의 `EXCLUDE`에 넣는다).

| 분류 | 스킬 | 용도 |
| --- | --- | --- |
| 길잡이 | `/mp-ask-matt` | 지금 상황에 맞는 스킬·흐름을 골라 준다 |
| 질문·정리 | `/mp-grill-me`, `/mp-grilling` | 계획·아이디어를 끝까지 캐물어 빈틈을 찾는다 |
| | `/mp-grill-with-docs` | 캐물으면서 ADR과 용어집을 같이 만든다 |
| | `/mp-to-questionnaire` | 혼자 못 정하는 결정을 남에게 보낼 질문지로 만든다 |
| | `/mp-wait-what` | 방금 설명이 이해 안 될 때 다시 설명하게 한다 |
| | `/mp-teach` | 새 개념·기술을 이 워크스페이스에서 가르쳐 준다 |
| 기획→작업 | `/mp-to-spec` | 지금까지 대화를 스펙으로 정리해 이슈 트래커에 올린다 |
| | `/mp-to-tickets` | 스펙을 수직 슬라이스 티켓(차단 관계 포함)으로 쪼갠다 |
| | `/mp-wayfinder` | 한 세션에 안 들어가는 큰 작업을 결정 티켓 지도로 계획한다 |
| | `/mp-triage` | 이슈·PR을 분류·검증해 에이전트용 브리프로 만든다 |
| 구현 | `/mp-implement` | 스펙이나 티켓을 받아 구현한다 |
| | `/mp-implement-spec` | `/mp-to-spec`·`/mp-to-tickets` 결과를 코드로 구현한다 |
| | `/mp-tdd` | 테스트 먼저(red-green-refactor)로 기능을 만든다 |
| | `/mp-prototype` | 설계 질문에 답하려고 버릴 프로토타입(로직/UI)을 만든다 |
| | `/mp-wizard` | 사람만 할 수 있는 설정(키, 대시보드)을 안내하는 bash 마법사를 만든다 |
| 설계 | `/mp-codebase-design` | 깊은 모듈, 인터페이스, 경계(seam)를 설계한다 |
| | `/mp-improve-codebase-architecture` | 코드베이스에서 깊게 만들 곳을 찾아 HTML 보고서로 보여 준다 |
| | `/mp-domain-modeling` | 도메인 용어집(GLOSSARY)과 ADR을 다듬는다 |
| 검증·디버깅 | `/mp-code-review` | 기준점 이후 변경을 코딩 표준과 스펙 두 축으로 리뷰한다 |
| | `/mp-diagnosing-bugs` | 어려운 버그와 성능 저하를 진단 루프로 잡는다 |
| 조사·문서 | `/mp-research` | 1차 자료로 조사해 레포에 Markdown으로 남긴다 |
| | `/mp-pr` | PR 본문을 쓴다 |
| | `/mp-writing-for-agents` | 스킬, CLAUDE.md처럼 에이전트가 읽을 문서를 쓴다 |
| 회고·인계 | `/mp-retro` | 코딩 세션을 돌아보고 환경 개선점을 낸다 |
| | `/mp-handoff` | 대화를 다른 에이전트용 인계 문서로 압축한다 |
| 초기 설정 | `/mp-setup-matt-pocock-skills` | 이슈 트래커, 라벨, 도메인 문서 위치를 정한다. 티켓·스펙 계열 스킬 전에 한 번 실행한다 |
| | `/mp-setup-pre-commit` | Husky와 lint-staged로 커밋 전 검사를 건다 |
| | `/mp-git-guardrails-claude-code` | 위험한 git 명령(push, reset --hard 등)을 훅으로 막는다 |
| 기타 | `/mp-migrate-to-shoehorn` | 테스트의 `as` 단언을 shoehorn으로 바꾼다(TS) |
| | `/mp-scaffold-exercises` | 강의용 연습 문제 폴더 구조를 만든다 |
| 실험 중 | `/mp-chief-of-staff` | 서브에이전트를 조율해 긴 목표를 한 세션에서 추진한다 |
| | `/mp-claude-handoff` | 지금 대화를 새 백그라운드 에이전트에 넘긴다 |
| | `/mp-loop-me` | 만들고 싶은 워크플로를 캐물어 스펙으로 만든다 |
| | `/mp-setup-ts-deep-modules` | TS 레포에 dependency-cruiser로 모듈 경계를 건다 |
| | `/mp-writing-fragments`, `/mp-writing-beats`, `/mp-writing-shape` | 글쓰기 3단계: 조각 모으기 → 흐름 짜기 → 문단 다듬기 |

## 출처
`/prd`, `/build-plan`, `/design`의 일부는 Matt Pocock의 [skills](https://github.com/mattpocock/skills)(MIT)에서, `systematic-debugging`은 Jesse Vincent의 [superpowers](https://github.com/obra/superpowers)(MIT)에서, `frontend-design`과 `webapp-testing`은 Anthropic(Apache 2.0)에서 가져왔다.
