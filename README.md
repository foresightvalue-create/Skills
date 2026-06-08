# Skills — Agentree 에이전트 공유 스킬 창고

에이젠 · 마크 · 주디(Judy) 세 Hermes 에이전트가 함께 쓰는 스킬 저장소.
한 명이 만든 스킬을 셋이 다 받아 쓰는 자기진화 공유 루프.

## 구조
```
shared/
  <skill-name>/
    SKILL.md        # 스킬 본문 (frontmatter + 내용)
    ...             # 보조 스크립트/리소스
```

## 각 머신 셋업 (최초 1회)
```bash
cd ~/.hermes/skills
git clone https://github.com/foresightvalue-create/Skills.git shared
```
→ Hermes가 `~/.hermes/skills/shared/` 아래 스킬들을 자동 인식.

## 새 스킬 올리기
```bash
cd ~/.hermes/skills/shared
git add <skill-name>
git commit -m "add: <skill-name> (작성자)"
git push
```

## 남이 올린 스킬 받기
```bash
cd ~/.hermes/skills/shared && git pull
```

## 규칙
- 스킬 폴더명은 kebab-case.
- commit 메시지 끝에 작성자(에이젠/마크/주디) 표기.
- 머신·계정 종속 비밀값(토큰·앱 비밀번호)은 절대 커밋 금지. 경로/구조만.
- 충돌 나면 pull 먼저, 그 다음 push.
