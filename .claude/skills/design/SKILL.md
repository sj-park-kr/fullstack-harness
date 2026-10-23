---
name: design
description: "docs/prd.md를 기준으로 architect 에이전트에 설계를 맡겨 docs/architecture.md, docs/api.md, docs/adr/NNN-*.md를 만든다. '설계해줘', '아키텍처 잡아줘', 'API 계약 정해줘', 'PRD로 설계', 'ADR 작성' 같은 요청에 사용한다. 설계 수정, 다시 설계, API 변경 같은 후속 요청에도 사용한다. 파이프라인 2단계이며 앞은 /prd, 다음은 /build-plan이다."
license: ADR 형식 일부는 Matt Pocock의 domain-modeling/ADR-FORMAT.md(MIT)에서 가져왔다. LICENSE.txt 참고
---

# 설계

메인 세션은 확인과 위임만 한다. 설계는 `architect`(opus)가 한 번에 끝낸다.

## 절차
1. `docs/prd.md`가 없으면 `/prd`를 먼저 하라고 안내하고 멈춘다.
2. `backend/`, `frontend/`가 있으면 아래 스택 가정과 맞는지 `scout`에 확인을 맡긴다. 없으면 가정대로 간다.
3. `architect`를 한 번 호출한다. 프롬프트는 아래 "위임 프롬프트"를 그대로 쓴다. 사용자가 지정한 스킬이 있으면 그 지침도 넣는다.
4. 결과 요약(10줄)과 경로를 사용자에게 전하고, 다음 단계로 `/build-plan`을 안내한다.
5. 수정 요청이면 바뀐 부분만 고치라고 같은 방식으로 다시 맡긴다.

## 스택 가정 (`.vscode/launch.json` 기준)
- 백엔드: `backend/`에서 `uvicorn app.main:app --port 8000` → `backend/app/main.py`에 FastAPI `app`.
- 프런트엔드: `frontend/`에서 `npm run dev` → `frontend/package.json`에 `dev` 스크립트(React).
- 실제 파일과 다르면 실제 파일을 따르고 ADR에 적는다.

## 위임 프롬프트

```
docs/prd.md를 읽고 설계 문서를 만든다. 긴 문서는 Grep으로 헤더를 찾아 필요한 구간만 읽는다.
필수(Must) 기능과 데모 시나리오만 설계한다. Nice 기능은 확장 지점만 한 줄로 적는다.
스택: backend/ FastAPI(app.main:app, 포트 8000), frontend/ React(npm run dev). <scout 확인 결과>

산출물(새 파일은 Write, 기존 파일은 바뀐 곳만 Edit):
1. docs/architecture.md: 구성 요소, 디렉터리 구조(backend/, frontend/ 하위), 데이터 모델, 화면 목록과 흐름, 외부 서비스, 환경 변수 이름(.env.example 기준). 기능 ID(M1...)와 구성 요소를 연결한다.
2. docs/api.md: 엔드포인트마다 메서드, 경로, 요청·응답 JSON 예시, 에러 형태, 관련 기능 ID. 백엔드와 프런트엔드 builder가 이 문서만 보고 따로 일할 수 있어야 한다.
3. docs/adr/NNN-<slug>.md(001부터, 기존 최대 번호 + 1): 되돌리기 어렵고, 맥락 없이 보면 의아하고, 실제 대안이 있었던 결정만 쓴다. 형식은 제목 + 1~3문장(맥락, 결정, 이유). 필요할 때만 "고려한 대안"을 덧붙인다.
4. docs/index.md에 위 문서 링크를 추가한다(없으면 만든다).

문서가 길어지면 주제별 파일로 나누고 docs/index.md에서 링크한다.
.env 파일은 읽지 않는다. 완료 후 요약 10줄과 경로만 반환한다.
```
