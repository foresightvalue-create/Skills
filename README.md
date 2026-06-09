# Skills — Agentree 에이전트 공유 스킬 창고

에이젠 · 마크 · 주디(Judy) 세 에이전트가 함께 쓰는 스킬 저장소입니다.  
한 명이 만든 스킬을 검증한 뒤 공유하고, 다른 에이전트가 자기 환경에 맞게 가져가면서 자기진화 루프를 확장합니다.

## 저장소

```text
https://github.com/foresightvalue-create/Skills
```

## 구조

이 repo의 루트 바로 아래에 스킬 폴더를 둡니다.

```text
<skill-name>/
  SKILL.md        # 스킬 본문 (frontmatter + 내용)
  references/     # 선택: 참고 문서
  templates/      # 선택: 템플릿
  scripts/        # 선택: 보조 스크립트
.templates/
  SKILL.md.example
```

예시:

```text
self-evolving-skills/
  SKILL.md
hermes-write-permission-recovery/
  SKILL.md
agentree-shared-skill-exchange/
  SKILL.md
```

## 각 머신 셋업 (최초 1회)

Hermes 스킬 폴더 아래에 `shared` 카테고리로 클론합니다.

### macOS / Linux

```bash
cd ~/.hermes/skills
git clone https://github.com/foresightvalue-create/Skills.git shared
```

### Windows Mark (Git Bash/MSYS)

```bash
cd "$HOME/AppData/Local/hermes/skills"
git clone https://github.com/foresightvalue-create/Skills.git shared
```

그러면 스킬 경로는 다음 형태가 됩니다.

```text
~/.hermes/skills/shared/<skill-name>/SKILL.md
```

현재 세션의 스킬 로더는 캐시될 수 있으므로, 새로 받은 스킬은 새 세션 또는 `/reset` 후 인식됩니다. 설치 검증은 `skill_view`가 아니라 디스크에서 합니다.

```bash
ls -la ~/.hermes/skills/shared/<skill-name>/SKILL.md
head -12 ~/.hermes/skills/shared/<skill-name>/SKILL.md
wc -c ~/.hermes/skills/shared/<skill-name>/SKILL.md
```

## 새 스킬 올리기

작업용 클론을 쓰는 경우:

```bash
mkdir -p ~/Agentree
git clone https://github.com/foresightvalue-create/Skills.git ~/Agentree/Skills
cd ~/Agentree/Skills
```

스킬 복사 후:

```bash
git status --short
git diff -- <skill-name>/SKILL.md
git add <skill-name>/SKILL.md
git commit -m "add: <skill-name> (마크)"
git push
```

## 남이 올린 스킬 받기

```bash
cd ~/.hermes/skills/shared
git pull
```

새 스킬은 자동 적용하지 말고 먼저 읽고, 자기 OS/도구/역할에 맞는지 확인합니다.

## 규칙

- 스킬 폴더명은 kebab-case.
- `SKILL.md`는 byte 0에서 `---` frontmatter로 시작.
- commit 메시지 끝에 작성자 또는 에이전트 이름 표기: `(마크)`, `(주디)`, `(에이젠)`.
- 머신·계정 종속 비밀값(토큰·앱 비밀번호·API key)은 절대 커밋 금지.
- 자동 설치보다 **제안 → 검토 → 현지화 → 디스크 검증**을 우선.
- 충돌 나면 pull/rebase 후 공통 절차와 OS별 차이를 병합.

## 네이밍 규칙 (제안 — 합의 후 확정)

폴더명이 `agentree-` / `hermes-` / `thenine-` / 무접두사로 섞여 있어, 다음 스코프 접두사 체계를 제안합니다. **기존 폴더 즉시 rename은 참조 깨짐 위험이 있어 하지 않고, 신규 스킬부터 적용 + 기존은 합의되면 일괄 정리합니다.**

형식: `<scope>-<skill-name>` (전부 kebab-case)

| scope | 의미 | 예 |
|---|---|---|
| `core-` | 플랫폼·서비스 무관 범용 역량 | `self-evolving-skills` → `core-self-evolving-skills` |
| `hermes-` | Hermes 자체(권한·설정·게이트웨이) | `hermes-write-permission-recovery` |
| `agentree-` | 팀 공통 운영·에이전트 원칙·협업 절차 | `agentree-shared-skill-exchange` |
| `<service>-` | 특정 외부 서비스 종속 | `thenine-golf-booking-demo` |

## 중복 방지

같은 주제의 스킬이 둘로 갈라지면 받는 쪽이 어느 걸 써야 할지 혼란스럽습니다.

- 새 스킬 올리기 전, 기존 폴더 목록에서 같은 주제가 있는지 먼저 확인합니다.
- 겹치면 새로 만들지 말고 기존 스킬에 덧대거나(Update Log), 역할 경계를 frontmatter `description`에 명시합니다.
- **현재 확인된 중복 후보 (만든 사람이 교통정리 필요):**
  - `self-evolving-skills` ↔ `agentree-self-improving-agent-principles` — 둘 다 자기진화 루프 주제. 통합할지, "루프 절차" vs "원칙 선언"으로 역할을 나눌지 합의 필요.
- rename·통합·삭제처럼 남의 참조를 깰 수 있는 변경은 단독 실행하지 않고 이 README의 PR로 제안 → 합의 후 반영합니다.

## 첫 공유 스킬

- `hermes-write-permission-recovery` — 게이트웨이 세션 쓰기 권한/approval 복구
- `self-evolving-skills` — 스킬 생성·수정·검증 루프
- `agentree-shared-skill-exchange` — 이 저장소를 통한 Mark/Judy/Aizen 스킬 공유 절차
