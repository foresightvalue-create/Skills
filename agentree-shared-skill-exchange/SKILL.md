---
name: agentree-shared-skill-exchange
description: "Use when Mark, Judy, or Aizen need to share, import, review, update, or publish Hermes/OpenClaw skills through Agentree's shared GitHub repository foresightvalue-create/Skills and Slack GitHub coordination space."
version: 1.0.0
author: Mark (for teddy / Agentree)
license: MIT
platforms: [windows, macos]
metadata:
  hermes:
    tags: [agentree, shared-skills, github, slack, mark, judy, aizen, self-evolution]
    related_skills: [self-evolving-skills, hermes-write-permission-recovery, github-workflows]
---

# Agentree 공유 스킬 교환 — Mark/Judy/Aizen

## Overview

Agentree의 Mark, Judy, Aizen은 서로 다른 컴퓨터와 세션에서 돌지만, 반복 절차와 시행착오를 공유 스킬로 모으면 하나의 에이전트 팀처럼 함께 성장할 수 있다. 이 스킬은 GitHub 저장소 `foresightvalue-create/Skills`를 공용 스킬 창고로 쓰는 표준 절차를 정의한다.

공유 저장소:

```text
https://github.com/foresightvalue-create/Skills
```

Slack의 GitHub 관련 대상 ID:

```text
D0B76P2LPD0
```

핵심 원칙은 자동 전파가 아니라 **검증된 공유 + 각 에이전트의 현지화**다. 한 에이전트가 만든 스킬을 다른 에이전트가 무조건 설치하지 않는다. 새 스킬을 발견하면 먼저 제안하고, 필요하면 자기 OS/도구/역할에 맞게 조정한 뒤 디스크 검증한다.

## When to Use

사용할 때:
- Mark가 만든 스킬을 Judy/Aizen도 쓰게 하고 싶을 때
- Judy나 Aizen이 만든 스킬을 Mark가 가져와야 할 때
- `foresightvalue-create/Skills` 저장소를 클론, pull, commit, push해야 할 때
- 공유 스킬 구조, 이름, README, 템플릿을 정리해야 할 때
- 여러 에이전트가 같은 스킬을 서로 다르게 수정해 충돌이 생겼을 때
- 주간 스킬 회고에서 "공유할 만한 스킬"이 발견됐을 때

사용하지 말 것:
- 비밀값, 토큰, 개인 인증 파일, API key를 공유하려 할 때
- 일회성 작업 로그나 낡기 쉬운 상태 정보를 저장하려 할 때
- 각 에이전트의 개인 기억(memory)을 통째로 공유하려 할 때
- 검증 없이 다른 에이전트가 만든 스킬을 자동 설치하려 할 때

## Repository Layout

권장 구조는 repo 루트 바로 아래에 스킬 폴더를 두는 것이다. 이 저장소를 `~/.hermes/skills/shared`로 클론하면 Hermes가 `shared` 카테고리 아래 스킬들로 인식할 수 있다.

```text
Skills/
  README.md
  .templates/
    SKILL.md.example
  self-evolving-skills/
    SKILL.md
  hermes-write-permission-recovery/
    SKILL.md
  agentree-shared-skill-exchange/
    SKILL.md
```

로컬에서 별도 작업용 클론을 둘 수도 있다.

```text
~/Agentree/Skills
```

## First-Time Setup

### Hermes skills 폴더에 직접 설치

각 에이전트 머신에서 최초 1회:

```bash
cd ~/.hermes/skills
git clone https://github.com/foresightvalue-create/Skills.git shared
```

Windows Mark의 bash 터미널에서는 다음 경로가 동작한다.

```bash
cd "$HOME/AppData/Local/hermes/skills"
git clone https://github.com/foresightvalue-create/Skills.git shared
```

이렇게 하면 공유 스킬은 대략 다음 위치에 놓인다.

```text
~/.hermes/skills/shared/<skill-name>/SKILL.md
```

현재 세션에서는 스킬 로더가 캐시되어 바로 안 보일 수 있다. 새 세션 또는 `/reset` 후 인식된다. 검증은 `skill_view`가 아니라 디스크로 한다.

### 작업용 클론

Mark가 repo를 정리하거나 커밋할 때는 작업용 클론을 쓸 수 있다.

```bash
mkdir -p ~/Agentree
git clone https://github.com/foresightvalue-create/Skills.git ~/Agentree/Skills
```

## Publishing a Skill

1. 스킬이 로컬에서 검증됐는지 확인한다.

```bash
ls -la "$HOME/AppData/Local/hermes/skills/software-development/<skill-name>/SKILL.md"
head -12 "$HOME/AppData/Local/hermes/skills/software-development/<skill-name>/SKILL.md"
wc -c "$HOME/AppData/Local/hermes/skills/software-development/<skill-name>/SKILL.md"
```

2. 공유 repo로 복사한다.

```bash
mkdir -p ~/Agentree/Skills/<skill-name>
cp ~/.hermes/skills/<category>/<skill-name>/SKILL.md ~/Agentree/Skills/<skill-name>/SKILL.md
```

3. diff를 확인한다.

```bash
cd ~/Agentree/Skills
git status --short
git diff -- <skill-name>/SKILL.md
```

4. 커밋하고 push한다.

```bash
git add <skill-name>/SKILL.md
git commit -m "add: <skill-name> (Mark)"
git push
```

`gh` CLI가 없어도 git push는 자격 증명이 있으면 동작한다. 자격 증명이 없으면 push에서 실패할 수 있으며, 이 경우 대표님이 GitHub 로그인/토큰 설정을 한 번 도와줘야 한다.

## Importing or Updating Shared Skills

각 에이전트는 자동 설치하지 말고 먼저 확인한다.

```bash
cd ~/.hermes/skills/shared
git pull
find . -name SKILL.md -maxdepth 2 -print
```

새 스킬이 보이면:

1. frontmatter를 확인한다.
2. 자기 OS/환경과 맞는지 확인한다.
3. 위험한 명령이나 비밀값이 들어 있지 않은지 확인한다.
4. 필요하면 현지화 patch를 만든다.
5. 디스크 검증 후 사용한다.

## Localizing Skills

공유 스킬에는 공통 절차를 우선 넣고, 에이전트별 차이는 명확히 표시한다.

예시:

```yaml
platforms: [windows, macos]
metadata:
  agentree:
    scope: shared
    tested_by: [mark]
    owners: [mark, judy, aizen]
```

본문에는 다음을 분리한다.

- 공통 원칙
- Windows Mark 전용 경로/명령
- macOS Judy 전용 경로/명령
- Aizen 전용 환경 차이
- 검증 명령

## Conflict Handling

충돌이 나면 자동으로 덮어쓰지 않는다.

```bash
cd ~/Agentree/Skills
git pull --rebase
```

충돌 파일을 읽고 다음 기준으로 정리한다.

- 공통 절차는 유지한다.
- OS별 차이는 별도 섹션으로 나눈다.
- 서로 다른 에이전트의 경험이 모두 유효하면 Common Pitfalls 또는 Local Notes에 병합한다.
- 비밀값/개인정보는 제거한다.

정리 후:

```bash
git add <file>
git rebase --continue
git push
```

## Slack/GitHub Coordination

Slack의 GitHub 관련 대상 `D0B76P2LPD0`는 공유 스킬 repo 변경 알림 또는 논의 공간으로 쓸 수 있다. Mark는 Slack API로 채널 이력을 직접 검색할 수 없으므로, 중요한 URL/PR/commit은 대표님이 메시지로 전달하거나 repo 자체에서 확인한다.

공유 알림 예시:

```text
Mark가 self-evolving-skills를 공유 repo에 업데이트했습니다. Judy/Aizen은 필요하면 pull 후 현지화하세요.
```

외부 Slack 발송은 대표님이 명시적으로 요청한 경우에만 한다.

## Common Pitfalls

1. **repo를 `shared/shared/<skill>` 구조로 중첩.** `~/.hermes/skills/shared/<skill-name>/SKILL.md`가 되도록 루트 바로 아래에 스킬 폴더를 둔다.
2. **자동 설치.** 다른 에이전트가 올린 스킬은 먼저 검토한다.
3. **비밀값 커밋.** 토큰, API key, 앱 비밀번호, 개인 인증 파일은 절대 올리지 않는다.
4. **개인 memory 공유.** memory는 에이전트/사용자별 맥락이므로 통째 공유하지 않는다.
5. **검증 없이 push.** 로컬 디스크 검증과 git diff 확인 후 커밋한다.
6. **OS 차이 무시.** Windows Mark와 macOS Judy는 경로와 shell이 다를 수 있다.
7. **gh CLI가 있다고 가정.** Mark 환경에는 gh가 없을 수 있다. git과 GitHub API로 대체한다.

## Verification Checklist

- [ ] repo URL이 `https://github.com/foresightvalue-create/Skills`인지 확인했다.
- [ ] `git status --short --branch`로 현재 브랜치와 변경사항을 확인했다.
- [ ] 스킬 폴더는 repo 루트 바로 아래 `<skill-name>/SKILL.md` 형태다.
- [ ] SKILL.md frontmatter가 byte 0 `---`로 시작한다.
- [ ] 비밀값이나 개인 인증 정보가 없다.
- [ ] `ls/head/wc`로 디스크 검증을 했다.
- [ ] `git diff`를 확인했다.
- [ ] 커밋 메시지에 작성자 또는 에이전트 이름을 남겼다.
- [ ] push 후 가능하면 GitHub에서 commit/repo 상태를 다시 확인했다.
