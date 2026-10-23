# fullstack-harness

## 하네스: 풀스택 서비스 개발 (해커톤 데모 우선)

**목표:** 토큰을 아끼면서 작업마다 알맞은 에이전트·모델·스킬로 해커톤 데모를 빠르게 완성한다.

**호출 조건:** 사용자가 `/fullstack-orchestrator`를 지정하면 그 절차를 따른다.

**파이프라인:** 사용자가 순서대로 직접 호출한다. 문서는 `docs/`에 두고 `docs/index.md`에서 링크한다.
1. `/prd` → `docs/prd.md` (입력: 기획 하네스 `plan/requirements.md`)
2. `/design` → `docs/architecture.md`, `docs/api.md`, `docs/adr/NNN-*.md` (architect)
3. `/build-plan` → `docs/plan.md` (단계, builder 수, 병렬/순차, 담당 디렉터리, 완료 조건)
4. `/fullstack-orchestrator` → `docs/plan.md` 단계별 builder 실행, 단계마다 qa
5. `/systematic-debugging` → 버그 근본 원인
6. `/webapp-testing` → 제출 전 Playwright 점검
7. `/evolve` → 회고 반영

**스킬 사용:** `caveman`, `ponytail`만 자동으로 쓴다. 나머지 스킬은 사용자가 `/이름`으로 지정할 때만 쓰고, 스스로 고르거나 제안 없이 불러오지 않는다. 사용자가 지정한 스킬 지침은 서브에이전트에 위임할 때 프롬프트에 함께 넣는다.

**작업 위임:** 여러 파일을 읽는 탐색은 `scout`(haiku), 기능 구현은 `builder`(sonnet), 설계와 막힌 버그는 `architect`(opus), 검증은 `qa`(sonnet)에 맡긴다. 한두 줄 수정은 직접 한다.

**응답 방식:** 세션 첫 응답 전에 `caveman` 스킬을 불러오고, 사용자가 "normal mode"라고 할 때까지 모든 답변을 그 규칙대로 아주 짧게 한다. 장황한 설명, 인사, 요약 반복을 하지 않는다.

**코드 작성:** 코드를 쓰거나 고치기 전에는 항상 `ponytail` 스킬을 불러와 따른다. 서브에이전트에게 맡길 때도 프롬프트에 이 규칙을 적는다.

**토큰 절약:** 서브에이전트에 맡길 때도 프롬프트에 이 규칙을 적는다.
- 코드와 문서를 고칠 때는 바꿀 위치만 Edit으로 수정한다. 파일 전체를 다시 쓰지 않는다(새 파일은 예외).
- PRD 같은 긴 문서는 전체를 읽지 않는다. Grep으로 필요한 헤더를 찾아 해당 구간만 `offset`/`limit`로 읽는다.
- 문서는 큰 파일 하나로 두지 않는다. 주제별 파일로 나누고 인덱스 문서에서 링크해, 필요한 파일만 골라 읽게 한다.

**보안:** `.env`와 `.env.*` 파일은 읽거나 수정하지 않는다(`.env.example`만 허용). 훅이 차단하면 우회하지 않는다.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
| --- | --- | --- | --- |
| 2026-10-22 | Harness v2로 처음 구성 | 전체 | - |
| 2026-10-22 | 토큰 절약 규칙 추가(부분 수정·부분 읽기·문서 분할) | CLAUDE.md | 토큰 사용량 절감 |
| 2026-10-22 | 하네스 이름 변경(hackathon → fullstack), 오케스트레이터 `fullstack-orchestrator`로 변경 | CLAUDE.md, README.md, settings.json, 오케스트레이터 스킬 | 코드 생성 특화 하네스로 범위 명확화. 솔루션 기획은 별도 하네스 |
| 2026-10-23 | `/prd`, `/design`, `/build-plan` 추가, 오케스트레이터가 `docs/plan.md`를 단계별 실행(`_workspace/01_architect_spec.md` → `docs/`) | 신규 스킬 3개, 오케스트레이터, architect·builder, settings.json, CLAUDE.md, README.md | PRD → 설계 → 계획 → 구현 파이프라인 고정 |
