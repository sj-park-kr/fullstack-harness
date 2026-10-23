# 핸드오프 (2026-10-22)

이전 세션은 `C:\project\hackathon-harness`에서 진행했다. 이 폴더는 그 복사본이며 하네스 이름을 `fullstack-harness`로 바꿨다. 이 파일을 읽고 이어서 진행한 뒤, 작업이 끝나면 이 파일을 지운다.

## 지금까지 한 일
- `.claude/settings.json`: `permissions.deny`에 `"Artifact"` 추가(VS Code에서 작업하므로 불필요, 컨텍스트 절약). 적용 확인됨.
- `CLAUDE.md`: **토큰 절약** 규칙 추가(부분 수정, 헤더 단위 부분 읽기, 문서 분할 + 인덱스 링크).
- 에이전트 4개(`scout`, `qa`, `builder`, `architect`)에 역할에 맞게 같은 규칙 추가.
- 이름 변경: `hackathon-orchestrator` → `fullstack-orchestrator`(스킬 폴더, name, settings.json, CLAUDE.md, README.md). 에이전트의 해커톤 원칙(데모 우선, 7시간)은 유지.

## 합의된 방향
- 솔루션 기획은 별도 기획 하네스가 맡는다. 그 산출물 형식은 미리 정하지 않고, 실제 구현할 때 사용자가 알려 준다.
- PRD는 이 하네스에서 만든다. PRD를 기준으로 아키텍처를 만든다.
- 이 하네스의 파이프라인(사용자가 순서대로 직접 호출):
  1. `/prd` (신규) → `docs/prd.md`
  2. `/design` (신규, architect) → `docs/architecture.md`, `docs/api.md`, `docs/adr/NNN-*.md` (ADR은 `/design`에 포함 추천)
  3. `/build-plan` (신규) → `docs/plan.md`: 구현 단계, 단계별 에이전트 수, 병렬/순차, 담당 디렉터리, 완료 조건
  4. `/fullstack-orchestrator` (수정 필요) → `plan.md` 순서대로 builder 호출, 단계마다 qa
  5. `/systematic-debugging` → 버그 근본 원인
  6. `/webapp-testing` → 제출 전 Playwright 점검
  7. `/evolve` → 회고 반영
- 문서는 `docs/index.md`에서 각 문서를 링크한다. 오케스트레이터의 `_workspace/01_architect_spec.md`는 `docs/`로 대체할 예정.

## 결정 결과 (2026-10-22)
1. `.vscode/` 3개 생성 완료(Tailwind 확장 제외). `launch.json`은 `backend/`에서 `app.main:app`, `frontend/`에서 `npm run dev`를 가정한다.
2. 문서 위치 `docs/`(git 포함)로 확정.
3. ~~보류~~ **완료(2026-10-23)**: `/prd`, `/design`, `/build-plan` 생성과 오케스트레이터 수정.

## 할 일
- [x] (2026-10-23 완료) 보류된 작업을 재개한다: `/prd`, `/design`, `/build-plan` 생성과 오케스트레이터 수정. `/prd`는 기획 하네스(`C:\project\planning-harness`)의 `plan/requirements.md`를 입력으로 받는다.
- [ ] `backend/`와 `frontend/`를 만든 뒤 `.vscode/launch.json`의 `app.main:app`, `npm run dev` 경로가 맞는지 확인한다.
- [ ] 사용자가 이전 폴더 `C:\project\hackathon-harness`를 확인하고 지운다.
- [ ] 아직 커밋하지 않은 `.claude/`, `.vscode/`, `CLAUDE.md` 등을 커밋한다.
- [ ] 심사위원 페르소나와 행사 정보는 기획 레포에 있다: `C:\project\planning-harness\judges\`, `event.md`.

## 참고
- 응답은 `caveman` 규칙, 코드는 `ponytail` 규칙(CLAUDE.md).
- 명령어에 `.env` 문자열이 들어가면 `block-env` 훅이 막는다. 우회하지 말고 Edit 툴을 쓴다.
- 이전 폴더 `C:\project\hackathon-harness`는 그대로 남아 있다. 확인 후 사용자가 지운다.
