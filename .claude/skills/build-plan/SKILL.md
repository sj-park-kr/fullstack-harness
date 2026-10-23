---
name: build-plan
description: "docs/prd.md와 설계 문서를 수직 슬라이스 단계로 나눠 docs/plan.md(단계별 builder 배치, 담당 디렉터리, qa 완료 조건)를 만들거나 고친다. 파이프라인 3단계이며 다음은 /fullstack-orchestrator다."
license: Complete terms in LICENSE.txt
---

# 빌드 계획

Matt Pocock의 `prd-to-plan`(MIT)을 오케스트레이터용으로 고쳤다.

## 절차
1. `docs/prd.md`, `docs/architecture.md`, `docs/api.md` 중 없는 것이 있으면 빠진 단계(`/prd`, `/design`)를 안내하고 멈춘다. Must와 완료 기준은 prd.md가 링크한 requirements.md에서 읽고 prd.md의 범위 조정을 적용한다.
   배포 모드는 인자, 없으면 `../planning-harness/plan/timeline.md` 머리의 `배포:`, 그것도 없으면 `railway whoami`가 성공하면 railway, 아니면 cloudflared.
2. 모든 단계가 공유할 고정 결정(경로, 데이터 모델, 디렉터리)을 설계 문서에서 뽑아 머리말에 둔다.
3. Must를 수직 슬라이스로 나누고, Nice는 마지막 단계들로 따로 둔다.
4. 단계 목록(제목, 기능 ID, builder 배치)을 번호 목록으로 보여 주고 합치거나 쪼갤 단계가 있는지 묻는다. 승인될 때까지 고친다. `date +%H:%M`이 11:00 이후면 묻지 않고 목록만 보여 준 뒤 바로 5로 간다.
5. 아래 템플릿으로 `docs/plan.md`를 쓰고 `docs/index.md`에 링크한다. `/fullstack-orchestrator`를 안내한다.

## 단계 규칙
- 단계마다 화면 → API → 데이터까지 좁지만 끝까지 잇는다. 한 층만 만드는 단계는 만들지 않는다. 끝난 단계는 혼자 데모할 수 있어야 한다.
- Phase 1은 뼈대다: `GET /api/health`, 그것을 불러 보여 주는 화면, Claude 호출 모듈(설계의 모델·폴백 규칙). `배포: railway`면 루트 `Dockerfile`과 `.dockerignore`(env 파일, `node_modules`, `.venv` 제외)도 만든다. 완료 조건에 "`npm run build` 후 uvicorn만 띄워 `http://localhost:<BACKEND_PORT>/`에서 health 결과가 보인다"와 "스모크 호출 1회가 API 키 또는 로컬 `claude -p`로 실제 응답을 받는다(둘 다 없으면 데모 응답)"를 넣는다. railway면 오케스트레이터가 이 단계 직후 첫 배포를 한다.
- Phase 2는 AI 핵심 Must(보통 M1)와 가치 숫자 화면까지 얇게 끝까지 잇는 경로다. 다른 Must는 그 뒤.
- Must 단계 전체가 13:15 전에 끝나야 한다. 단계 하나는 builder가 새 컨텍스트에서 20~30분에 끝낼 크기로, Must는 보통 2~4단계.
- 바뀌기 쉬운 함수·파일 이름은 쓰지 않는다. 경로, 스키마 같은 고정 결정은 쓴다.

## 배치 규칙
- builder는 1~3명, 보통 2명(`backend/`, `frontend/`) 병렬.
- 병렬 builder의 담당 디렉터리는 겹치면 안 된다(`backend/`와 `backend/app/`도 겹침). 루트 파일이나 `docs/api.md`를 고치는 일은 한 builder에게만 준다.
- `docs/api.md`에 계약이 없는 일은 순차로 둔다.
- 완료 조건은 qa가 실행해 확인할 수 있는 동작으로 쓴다(요청과 기대 응답, 클릭과 기대 화면).

## 템플릿

오케스트레이터가 읽는 형식이다. 헤더와 키 이름을 바꾸지 않는다. 상태는 `대기`, `완료`, `건너뜀` 중 하나다. builder 표의 행 하나가 builder 한 명이다.

```md
# Plan: <서비스 이름>

> 출처: docs/prd.md, docs/architecture.md, docs/api.md

## 고정 결정
- 경로: ...
- 데이터 모델: ...
- 디렉터리: backend/ (FastAPI), frontend/ (React)
- 배포: railway|cloudflared|local

---

## Phase 1: <제목>
- 상태: 대기
- 목표: <이 단계가 끝나면 데모에서 되는 것 한 문장>
- 기능: M1
- 실행: 병렬

| builder | 담당 디렉터리 | 할 일 |
| --- | --- | --- |
| backend | backend/ (railway면 Dockerfile, .dockerignore) | ... |
| frontend | frontend/ | ... |

### 완료 조건 (qa)
- [ ] ...

---

## Phase 2: <제목>
...
```
