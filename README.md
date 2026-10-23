# fullstack-harness

AI 해커톤용 풀스택 Claude Code 하네스 (에이전트 팀 + 스킬).

## 파이프라인
순서대로 직접 호출한다. 문서는 `docs/`에 쌓이고 `docs/index.md`에서 링크된다.

| 순서 | 스킬 | 산출물 |
| --- | --- | --- |
| 1 | `/prd` | `docs/prd.md` |
| 2 | `/design` | `docs/architecture.md`, `docs/api.md`, `docs/adr/` |
| 3 | `/build-plan` | `docs/plan.md` |
| 4 | `/fullstack-orchestrator` | `backend/`, `frontend/` 코드 (단계마다 qa) |
| 5 | `/systematic-debugging` | 버그 근본 원인 수정 |
| 6 | `/webapp-testing` | 제출 전 Playwright 점검 |
| 7 | `/evolve` | 하네스 회고 반영 |

`/prd`, `/build-plan`은 Matt Pocock의 [skills](https://github.com/mattpocock/skills)(MIT)를 고친 것이다.
