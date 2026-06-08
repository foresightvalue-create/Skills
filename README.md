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

## 첫 공유 스킬

- `hermes-write-permission-recovery` — 게이트웨이 세션 쓰기 권한/approval 복구
- `self-evolving-skills` — 스킬 생성·수정·검증 루프
- `agentree-shared-skill-exchange` — 이 저장소를 통한 Mark/Judy/Aizen 스킬 공유 절차
