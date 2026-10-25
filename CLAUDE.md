# fullstack-harness

해커톤 데모 빌드 하네스. 2026-10-24 일정: 10:45 구현 시작, 13:15 기능 동결, 13:45 배포 링크 고정, 14:30 제출. 심사위원은 데모 링크와 덱 2장을 혼자 본다.

**파이프라인:** 사용자는 스킬 이름을 말하지 않는다. 요청을 보고 아래에서 맞는 단계를 골라 스스로 호출하고, 앞 단계 산출물이 없으면 그 단계부터 이어 간다. 고른 단계는 한 줄로 알린다. 문서는 `docs/`에 두고 `docs/index.md`에서 링크한다.
1. `/prd` → `docs/prd.md` (입력: 형제 폴더 `../planning-harness/plan/requirements.md`)
2. `/design` → `docs/architecture.md`, `docs/api.md`, `docs/adr/`
3. `/build-plan` → `docs/plan.md`
4. `/fullstack-orchestrator` → 단계별 구현, 단계마다 qa, 배포
5. 버그·에러·"안 돼" → `systematic-debugging`. 화면 동작 확인·스크린샷 → `webapp-testing`. UI 새로 만들기·디자인 → `frontend-design`. "설명해줘"·"이해 안 돼" → `eli5`.
6. `/evolve`(행사 후 회고)는 사용자가 부를 때만.

**스킬:** 위 파이프라인 스킬과 `ponytail`(builder는 Claude 호출 코드에 `claude-api`도)은 스스로 쓴다. 맷 포콕 스킬과 내장 스킬은 사용자가 `/이름`으로 지정할 때만 쓰고, 그 지침은 위임 프롬프트에 넣는다.

**위임:** 거의 모든 작업은 서브에이전트에 맡긴다. 여러 파일 탐색은 `scout`, 구현은 `builder`, 설계와 막힌 버그는 `architect`, 검증은 `qa`, 그 밖의 조사·문서 작성은 범용 서브에이전트. 메인은 작업을 나누고, 위임 프롬프트를 쓰고, 결과를 검토·통합해 보고한다. 서로 독립인 작업은 한 메시지에서 병렬로 띄운다. 위임 프롬프트에는 목표, 먼저 읽을 파일, 이미 확인한 것, 산출물 경로·형식, 이 파일의 규칙을 적는다. 메인이 직접 하는 것: 한두 줄 수정, 바로 답할 수 있는 질문, 사용자 결정이 필요한 질문.

**응답:** `caveman` 규칙은 훅(`.claude/hooks/caveman.mjs`)이 세션 시작·매 턴·모든 서브에이전트에 넣는다. 사용자가 "normal mode"라고 할 때까지 따른다. `docs/` 문서는 caveman 말투로 쓰지 않는다.

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
| 2026-10-23 | TODO.md 규칙(남은 일·확인할 일, 로컬 전용) | CLAUDE.md, .gitignore | 사용자가 남은 일을 매번 묻지 않게 |
| 2026-10-25 | caveman을 SessionStart·SubagentStart 훅으로 항상 적용, 파이프라인 스킬 자동 호출(요청 보고 단계 선택), eli5·frontend-design 자동 허용 | CLAUDE.md, settings.json, hooks/caveman.mjs, README | 해커톤 회고: 플래닝·서브에이전트에 caveman 미적용, 스킬 이름을 매번 말하기 힘듦 |
| 2026-10-25 | caveman 훅에 UserPromptSubmit 추가: 매 턴 짧은 리마인더, "normal mode"/"stop caveman"으로 끄고 "/caveman"으로 다시 켬(세션별) | settings.json, hooks/caveman.mjs, CLAUDE.md | SessionStart만으로는 훅 추가 전에 시작된 세션·긴 세션에서 caveman이 빠짐 |
| 2026-10-25 | 위임 규칙 강화: 거의 모든 작업을 서브에이전트에 맡기고(전용 에이전트 없으면 범용) 메인은 나누기·검토·통합·보고 | CLAUDE.md | 사용자 요청: 위임 범위가 탐색·구현·검증으로만 한정돼 있었음 |
