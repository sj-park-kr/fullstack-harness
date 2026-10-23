# 맷 포콕 스킬 안내 (`mp-*`)

출처는 [mattpocock/skills](https://github.com/mattpocock/skills)(MIT)다. 설치할 때 이름 앞에 `mp-`를 붙인다. 업데이트는 `python .claude/scripts/update-mp-skills.py`로 한다. 모두 사용자가 `/mp-이름`으로 직접 부를 때만 동작한다. 예외는 `mp-grilling`이다. 다른 스킬이 이것을 부르기 때문이다.

헷갈리면 `/mp-ask-matt`에게 "지금 이런 상황인데 뭘 써야 해?"라고 물으면 된다.

## 먼저 알아 둘 것

- **이슈 트래커가 필요한 스킬이 있다.** `mp-to-spec`, `mp-to-tickets`, `mp-implement-spec`, `mp-triage`, `mp-wayfinder`, `mp-code-review`(스펙 찾기)가 그렇다. 처음 쓰기 전에 `/mp-setup-matt-pocock-skills`를 한 번 실행한다. GitHub 이슈가 없으면 "local"을 고른다. 그러면 `.scratch/` 폴더에 마크다운 파일로 쌓인다.
- **용어집과 ADR.** 여러 스킬이 `GLOSSARY.md`(프로젝트 용어집)와 ADR(되돌리기 어려운 결정 기록)을 읽고 쓴다. 파일이 없으면 필요할 때 만든다.
- **해커톤 당일에는 우리 파이프라인이 먼저다.** 기획은 `/plan-orchestrator`, 구현은 `/prd → /design → /build-plan → /fullstack-orchestrator`다. `mp-*`는 막혔을 때 꺼내는 도구다. `/build-plan`이 만드는 단계 티켓은 로컬 트래커 형식(`.scratch/build/issues/`)이라 `/mp-implement 티켓경로`, `/mp-code-review`가 바로 읽는다(셋업 불필요). 당일에 쓸 만한 것에는 ★를 붙였다.

## 큰 흐름: 아이디어 → 출시

```
아이디어
  │  /mp-grill-with-docs   (레포 있음: 캐묻고 용어집·ADR 남김)
  │  /mp-grill-me          (레포 없음: 캐묻기만)
  │     └ 말로 결론이 안 나면 → /mp-prototype (버리는 코드로 확인)
  ▼
여러 세션이 걸릴 큰 작업인가?
  ├ 아니오 → /mp-implement (이 대화에서 바로 구현)
  └ 예 → /mp-to-spec → /mp-to-tickets → 둘 중 하나:
           /mp-implement  티켓 하나씩, 티켓마다 /clear
           /mp-implement-spec  전체 티켓을 서브에이전트로 병렬 구현
  ▼
구현 안에서 자동 호출: /mp-tdd (테스트 먼저) → /mp-code-review (리뷰)
  ▼
/mp-pr (PR 본문) → /mp-retro (회고: 다음 작업 환경 개선)
```

진입로는 두 가지가 더 있다.
- **남이 올린 이슈가 쌓였다** → `/mp-triage` → 준비된 이슈는 `/mp-implement`로 처리한다.
- **안개 낀 거대 작업**(새 프로젝트, 몇 세션으로도 안 끝나는 기능) → `/mp-wayfinder`로 결정을 하나씩 정리한다 → 길이 보이면 `/mp-to-spec`으로 합류한다.

grill부터 to-tickets까지는 **한 대화 안에서 끊지 않고** 하는 게 좋다. 캐묻기, 스펙, 티켓이 같은 생각 위에 쌓여야 하기 때문이다.

---

## 1. 캐묻기 계열: 이름이 비슷해서 헷갈리는 묶음

모두 같은 엔진(`mp-grilling`)을 쓴다. 차이는 **무엇을 남기느냐**다.

| 스킬 | 남기는 것 | 언제 |
| --- | --- | --- |
| `mp-grilling` | 없음 (엔진) | 직접 부를 일은 거의 없다. 아래 스킬들이 안에서 부른다 |
| ★`mp-grill-me` | 없음 | 레포 없이 계획, 아이디어, 글을 검증할 때. 해커톤 아이디어 검증에 딱 맞다 |
| `mp-grill-with-docs` | `GLOSSARY.md`, ADR | 레포 안에서 기능 아이디어를 다듬을 때. 레포가 있으면 grill-me보다 이게 낫다 |
| `mp-loop-me` | `workflows/*.md` | "매일 반복하는 이 일을 자동화하고 싶다". 반복 업무를 워크플로 스펙으로 만든다 |
| `mp-to-questionnaire` | 질문지 `.md` | 답을 내가 아니라 **남**(고객, 팀원, 전문가)이 알 때. 그 사람에게 보낼 질문지를 만든다 |

**grilling 진행 방식:** 지금 물을 수 있는 질문을 한 번에 번호를 붙여 묻는다. 질문마다 추천 답(➡️)을 단다. "yes"라고 하면 추천 답을 받아들인 것이다. 사실 확인(파일, 도구)은 AI가 직접 조사하고, 결정만 사람에게 묻는다. 더 물을 게 없으면 끝난다.

## 2. 기획 → 작업 쪼개기

| 스킬 | 하는 일 | 순서·차이 |
| --- | --- | --- |
| `mp-to-spec` | 지금까지 대화를 스펙으로 정리해 트래커에 올린다. **새로 묻지 않고 종합만** 한다 | grill 다음 |
| `mp-to-tickets` | 스펙을 수직 슬라이스 티켓으로 쪼갠다. 티켓마다 "이게 끝나야 시작 가능" 관계(blocking)를 단다 | to-spec 다음 |
| `mp-wayfinder` | 너무 커서 스펙도 못 쓰는 작업을 "결정 티켓 지도"로 만들어 하나씩 푼다. **만들지 않고 결정만** 한다 | 끝나면 to-spec으로 합류 |
| `mp-triage` | 남이 올린 버그와 요청을 분류하고(bug/enhancement, needs-info, ready-for-agent…) 에이전트용 브리프로 만든다 | 내가 만든 티켓에는 쓰지 않는다 |

**수직 슬라이스:** DB, API, UI, 테스트를 얇게 한 줄로 관통하는 조각이다. 하나만 끝나도 데모가 된다. 우리 `/build-plan`의 단계 나누기와 같은 생각이다.

## 3. 구현

| 스킬 | 하는 일 | 차이 |
| --- | --- | --- |
| `mp-implement` | 스펙이나 티켓 하나를 구현한다. 안에서 `mp-tdd`를 쓰고, 끝나면 `mp-code-review`를 하고, 커밋한다 | 혼자 순서대로 |
| `mp-implement-spec` | 스펙 전체를 통합 브랜치 하나에 구현한다. 막힘이 없는 티켓들을 서브에이전트가 병렬로(각자 worktree) 만들고 합친다 | 병렬 지휘. 트래커 필요 |
| `mp-tdd` | 테스트 먼저: 실패하는 테스트 1개 → 통과하는 최소 코드 → 반복. 리팩터링은 리뷰 단계로 미룬다 | implement가 자동으로 부른다 |
| ★`mp-prototype` | 질문 하나에 답하려는 **버릴 코드**. 로직이면 상태를 눌러 보는 HTML 한 장, UI면 URL 파라미터로 바꿔 보는 여러 시안 | 해커톤 화면 시안 비교에 유용 |
| ★`mp-wizard` | 사람만 할 수 있는 단계(키 발급, 대시보드 클릭, 배포 설정)를 안내하는 bash 마법사를 만든다 | Railway 등 설정이 막힐 때 |

## 4. 설계 (코드 구조)

| 스킬 | 하는 일 | 관계 |
| --- | --- | --- |
| `mp-codebase-design` | "깊은 모듈" 설계 용어집이다: 작은 인터페이스 뒤에 많은 동작을 숨기고, seam(경계)을 정한다. 삭제 테스트: 지워서 복잡도가 사라지면 쓸모없는 모듈이다 | 다른 스킬들이 참고서로 부른다 |
| `mp-improve-codebase-architecture` | 코드베이스를 훑어 "깊게 만들 후보"를 HTML 보고서로 보여 준다. 하나를 고르면 grilling으로 파고든다 | 후보 찾기용. 고른 뒤 설계는 codebase-design |
| `mp-domain-modeling` | 도메인 용어를 다듬는다(한 단어가 세 가지 뜻이면 정리). `GLOSSARY.md`와 ADR을 갱신한다 | grill-with-docs가 안에서 부른다 |
| `mp-setup-ts-deep-modules` | TS 레포에 dependency-cruiser를 걸어 패키지 내부 import를 막는다 (실험 중) | TS 전용 |

## 5. 검증 · 디버깅

| 스킬 | 하는 일 | 비슷한 것과 차이 |
| --- | --- | --- |
| `mp-code-review` | 기준점(커밋, 브랜치) 이후 변경을 두 축으로 병렬 리뷰한다: **표준**(레포 코딩 규칙, 코드 냄새)과 **스펙**(이슈가 요구한 대로인가) | 내장 `/code-review`는 버그 찾기 중심이고 스펙 축이 없다 |
| ★`mp-diagnosing-bugs` | 어려운 버그용. **먼저 버그를 빨간불로 재현하는 명령 하나**(테스트, curl, Playwright…)를 만들고, 그다음에만 원인을 추정한다. 고친 뒤 회귀 테스트를 남긴다 | fullstack의 `systematic-debugging`과 목적이 같다. 파이프라인 문서는 systematic-debugging 기준이다 |
| `mp-wait-what` | 방금 AI 설명이 이해 안 될 때 쓴다. 맥락을 붙여 쉬운 말로 다시 설명하게 한다 | 아래 "eli5" 참고 |

## 6. 조사 · 글쓰기

| 스킬 | 하는 일 | 차이 |
| --- | --- | --- |
| ★`mp-research` | 백그라운드 에이전트가 1차 자료(공식 문서, 소스)로 조사하고, 출처가 달린 Markdown을 레포에 남긴다. 그동안 나는 다른 일을 한다 | 내장 `deep-research`는 웹 여러 곳을 종합한 긴 보고서다. mp-research는 짧고 레포에 파일로 남는다 |
| `mp-pr` | PR 본문을 쓴다: 변경을 보여 주는 최소 시각자료, 전후 증거, 되돌릴 수 있는지(one-way/two-way door) | |
| `mp-writing-for-agents` | 스킬, CLAUDE.md처럼 **에이전트가 읽을 문서** 쓰는 법이다 | retro가 안에서 부른다 |
| `mp-writing-fragments` | 글쓰기 1단계(**탐색**): 구조 없이 캐물어 쓸 만한 조각을 한 파일에 모은다 | 먼저 |
| `mp-writing-beats` | 글쓰기 2단계(**활용**) A안: 조각 더미에서 "비트"를 하나씩 골라 이어 간다. 매번 2~3개 다음 방향을 제시하는 선택형 진행 | fragments 다음, shape와 **택일** |
| `mp-writing-shape` | 글쓰기 2단계(**활용**) B안: 시작 문단 2~3개 중 하나(=논지)를 고르고 문단 단위로 키운다 | fragments 다음, beats와 **택일** |

글쓰기는 `fragments → (beats 또는 shape)` 순서다. 흐름을 탐험하듯 짜고 싶으면 beats, 주장을 정하고 밀어붙이려면 shape다. 둘 다 독자가 아직 모르는 개념을 먼저 설명하고 나서야 그 개념을 쓴다("grounding").

## 7. 세션 관리 · 인계

| 스킬 | 하는 일 | 차이 |
| --- | --- | --- |
| ★`mp-handoff` | 대화를 인계 문서(임시 폴더)로 압축한다. 다음 에이전트가 부를 스킬도 적는다 | 파일만 만든다. 어디서든 그 파일로 새 세션을 시작한다 |
| `mp-claude-handoff` | handoff 문서를 만든 뒤 바로 `claude --bg`로 **백그라운드 에이전트를 띄워** 이어서 일을 시킨다 (실험 중) | 문서 작성 + 실행까지 |
| `mp-chief-of-staff` | 긴 목표를 한 세션에서 지휘한다. 일은 모두 서브에이전트가 하고, 기억은 wiki 폴더에 날짜를 붙여 남긴다 (실험 중) | 장기 프로젝트용 |
| `mp-retro` | 세션을 돌아보고 코드가 아니라 **환경** 개선점을 낸다(찾기 쉬운 문서, 자동 검사, 리뷰 규칙, 도구 비용) | 우리 `/evolve`와 비슷하다. evolve는 하네스에 직접 반영까지 한다 |

**언제 handoff가 필요한가** (`mp-ask-matt/PHASE-BOUNDARIES.md` 요약). 한 작업 단계가 끝났을 때 위에서부터 보고, 처음 "예"가 나오는 걸 고른다.
1. 이 세션에서 계속할 수 있나? (다음 단계가 지금 맥락을 필요로 하고 여유가 있음) → 계속
2. 지금 맥락이 다음 일과 무관한가? → `/clear`
3. 다른 도구, 다른 폴더, 동료에게 넘기거나, 곁가지 일을 떼어내나? → `/mp-handoff`
4. 혼자 돌려도 되는 일인가? → 서브에이전트
5. 그 외 → `/compact` (예: `/compact 이제 QA 할 거야`)

## 8. 학습 · 기타

| 스킬 | 하는 일 |
| --- | --- |
| `mp-teach` | 여러 세션에 걸쳐 개념을 가르친다. 현재 폴더에 목표(MISSION), 자료(RESOURCES), HTML 레슨, 학습 기록을 쌓는다. 빈 폴더에서 시작하는 게 좋다 |
| `mp-ask-matt` | 상황을 말하면 맞는 스킬이나 흐름을 골라 준다 |
| `mp-setup-matt-pocock-skills` | 이슈 트래커(GitHub/GitLab/local), 라벨, 도메인 문서 위치를 설정한다. 트래커 계열을 쓰기 전에 한 번 실행한다 |
| `mp-setup-pre-commit` | Husky + lint-staged로 커밋 전 포맷, 타입, 테스트 검사를 건다 |
| `mp-git-guardrails-claude-code` | 위험한 git 명령(push, reset --hard, clean, branch -D)을 훅으로 막는다 |
| `mp-migrate-to-shoehorn` | TS 테스트의 `as` 단언을 shoehorn 라이브러리로 바꾼다 |
| `mp-scaffold-exercises` | 강의용 연습 문제 폴더 구조를 만든다 (포콕 강의 제작용) |

## 다른 스킬과 겹치는 것

| mp 스킬 | 겹치는 스킬 | 고르는 법 |
| --- | --- | --- |
| `mp-code-review` | 내장 `/code-review` | 스펙과 맞는지까지 보려면 mp. 버그만 빨리 보려면 내장 |
| `mp-research` | 내장 `deep-research` | 레포에 짧은 근거 노트를 남기려면 mp. 시장·경쟁 조사 보고서는 deep-research |
| `mp-diagnosing-bugs` | `systematic-debugging` (fullstack) | 둘 다 원인부터 찾는다. 재현 루프 만드는 방법 목록은 mp가 더 구체적이다 |
| `mp-retro` | `/evolve` | 제안만 받으려면 mp. 하네스에 반영까지 하려면 evolve |
| `mp-handoff` | `mp-claude-handoff` | 문서만 만들려면 handoff. 바로 백그라운드로 이어 돌리려면 claude-handoff |

## eli5는?

맷 포콕 스킬이 아니다. fullstack-harness에 `/eli5`로 있다. 대상 수준(초등학생, 매니저 등)에 맞춰 설명한다. 방금 AI 설명을 쉽게 다시 듣고 싶을 때는 `/mp-wait-what`도 된다.
