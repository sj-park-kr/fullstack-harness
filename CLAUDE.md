# fullstack-harness

해커톤 데모 빌드 하네스. 2026-10-24 일정: 10:45 구현 시작, 13:15 기능 동결, 13:45 배포 링크 고정, 14:30 제출. 심사위원은 데모 링크와 덱 2장을 혼자 본다.

**파이프라인:** 사용자가 순서대로 직접 호출한다. 문서는 `docs/`에 두고 `docs/index.md`에서 링크한다.
1. `/prd` → `docs/prd.md` (입력: 형제 폴더 `../planning-harness/plan/requirements.md`. 기획 폴더가 다른 곳이면 경로를 묻고 `NOTES.md`에 적는다. 이후 `../planning-harness`는 그 경로로 읽는다)
2. `/design` → `docs/architecture.md`, `docs/api.md`, `docs/adr/`
3. `/build-plan` → `docs/plan.md`, 티켓 `.scratch/build/issues/NN-*.md`(맷 포콕 로컬 트래커 형식, `docs/agents/issue-tracker.md`)
4. `/fullstack-orchestrator` → 단계별 구현, 단계마다 qa, 배포
5. 필요할 때: `/systematic-debugging`, `/webapp-testing`, `/evolve`(행사 후 회고)

## Agent skills

### Issue tracker

로컬 마크다운. `.scratch/<feature>/issues/NN-*.md`, `/build-plan` 티켓은 `.scratch/build/`. See `docs/agents/issue-tracker.md`(없으면 `.claude/skills/mp-setup-matt-pocock-skills/issue-tracker-local.md`).

**스킬:** `caveman`, `ponytail`(builder는 Claude 호출 코드에 `claude-api`도)만 스스로 쓴다. 나머지(맷 포콕 스킬 포함)는 사용자가 `/이름`으로 지정할 때만 쓰고, 그 지침은 위임 프롬프트에 넣는다.

**위임:** 여러 파일 탐색은 `scout`, 구현은 `builder`, 설계와 막힌 버그는 `architect`, 검증은 `qa`. 한두 줄 수정은 직접 한다.

**응답:** 세션 첫 응답 전에 `caveman`을 불러오고 사용자가 "normal mode"라고 할 때까지 따른다. `docs/` 문서는 caveman 말투로 쓰지 않는다.

**코드:** 코드를 쓰거나 고치기 전에 `ponytail`을 불러와 따른다.

**토큰:**
- 바꿀 곳만 Edit한다. 파일 전체를 다시 쓰지 않는다(새 파일은 예외).
- 긴 문서는 Grep으로 헤더를 찾아 그 구간만 `offset`/`limit`로 읽는다.
- 문서가 길어지면 주제별 파일로 나누고 `docs/index.md`에서 링크한다.

**보안:** `.env`, `.env.*`는 읽거나 고치지 않는다(`.env.example`만 허용). 훅이 막으면 우회하지 않는다.

**메모장:** 다음 세션에도 지켜야 하고 코드·문서·git으로 알 수 없는 결정·선호·제약이 프롬프트에 나오면 `NOTES.md`에 한 줄로 적는다. 적을 때 낡거나 겹치는 줄은 지우거나 합친다. 일회성 정보, 진행 상황, 이미 규칙에 있는 것은 적지 않는다.
@NOTES.md
**TODO:** 남은 작업과 사용자가 확인·결정할 일은 `TODO.md`에 `- [ ]` 한 줄로 적는다. 생기면 바로 추가하고, 끝나면 지운다(완료 기록은 남기지 않는다). "남은 거"를 물으면 이 파일로 답한다.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
| --- | --- | --- | --- |
| 2026-10-22 | Harness v2로 처음 구성 | 전체 | - |
| 2026-10-22 | 토큰 절약 규칙 추가 | CLAUDE.md | 토큰 절감 |
| 2026-10-22 | hackathon → fullstack 이름 변경 | 전체 | 기획은 별도 하네스 |
| 2026-10-23 | `/prd`, `/design`, `/build-plan` 추가, 오케스트레이터가 `docs/plan.md` 실행 | 스킬, 에이전트, 설정 | PRD → 설계 → 계획 → 구현 고정 |
| 2026-10-23 | 2.5시간 일정, 시간 동결, 단일 서비스 배포(Railway, 대안 cloudflared), 목업·제약 연결, 중복 규칙 제거 | 전체 | 감사 결과: 배포 경로 없음, 7시간 가정 |
| 2026-10-23 | E2E 5회 반영: Claude 호출 설정(CLAUDE_MODEL, 폴백 비표시), 포트는 architecture.md 한 곳, Phase 1 LLM 스모크, Phase 2=AI 핵심, 배포 모드 분기(Dockerfile은 railway만), /prd는 링크+델타, 사전 점검, with_server로만 서버 기동·정지, qa 스크린샷 → planning plan/shots, builder에 claude-api 허용 | design, build-plan, prd, fullstack-orchestrator, builder, qa, launch.json, settings.json, with_server.py | 5전 0승: AI 안 보임, 포트·경로 하드코딩, 배포 강제, 셸 자살 |
| 2026-10-23 | 맷 포콕 스킬 38개에 `mp-` 접두사, `.claude/scripts/update-mp-skills.py`로 업데이트 | skills, settings.json, README | 출처 구분, 원본 업데이트 |
| 2026-10-23 | `/build-plan` 단계를 로컬 이슈 티켓으로, 오케스트레이터는 Status·Blocked by로 다음 티켓 선택 | build-plan, fullstack-orchestrator, CLAUDE.md, README, MP-SKILLS | mp 스킬과 같은 트래커 공유 |
| 2026-10-23 | 3회차 테스트 반영: Phase 2 = M1 최종 결과물까지, Phase 3 = 평가·미션 증거 화면, 시계 기준 승인 생략 제거, 티켓 Status 두 형식 인식. 버그: CLI `is_error` 폴백, memo `cached` 표시와 qa 실호출 확인, qa 통과마다 스크린샷 복사, 스모크 수동, 레포 밖 쓰기 금지·긴 경로 점검, qa 리디렉션·부분 문자열 금지 | build-plan, fullstack-orchestrator, design, builder, qa | 0/2: 결과물·운영 콘솔이 범위 밖 |
| 2026-10-23 | TODO.md 규칙(남은 일·확인할 일, 로컬 전용) | CLAUDE.md, .gitignore | 사용자가 남은 일을 매번 묻지 않게 |
| 2026-10-23 | 2회차 테스트 반영: 로컬 CLI(`--model`, JSON, stdin, 120초, 병렬), 응답 source/latency/cost와 qa 확인, M1 다단계 파이프라인, 숫자는 고정 규칙, Phase 2에 사용자 입력, 키 없으면 cloudflared, 서버 로그 파일, 기획 폴더 못 찾으면 묻기, 서브에이전트 대체 | design, builder, qa, build-plan, fullstack-orchestrator, with_server.py, CLAUDE.md | 0/2: AI 얕음, 폴백 확인 불가, 경로 고정 |
