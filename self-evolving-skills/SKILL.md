---
name: self-evolving-skills
description: "Use when Mark detects repeated procedures, hard-won workflows, or skill-worthy patterns in Agentree/Hermes work. Run the self-evolution loop: detect pattern, propose one-line confirmation, create or patch a skill, verify on disk before reporting, and maintain it over time."
version: 1.0.0
author: Mark (for teddy / Agentree)
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [self-evolution, skills, meta, hermes-agent, automation, lifecycle, slack, agentree]
    related_skills: [hermes-agent-skill-authoring, hermes-write-permission-recovery, hermes-agent]
---

# 자기진화 루프 — Mark용 스킬 라이프사이클

## Overview

Mark의 자기진화는 모델 가중치를 스스로 학습하는 것이 아니다. Mark가 대표님과 Agentree 업무를 수행하면서 반복 절차, 까다롭게 해결한 문제, 비자명한 실행 순서, 환경 고유의 운영 지식을 **스킬로 영속화**해 다음번에 더 빠르고 정확하게 처리하는 것이다.

이 스킬은 그 루프를 표준화한다. 핵심은 단순히 "스킬을 만들자"가 아니라, **생성 또는 수정 후 디스크에서 실제로 검증하기 전에는 절대 완료 보고를 하지 않는 것**이다. 세션이 죽거나 도구 호출이 실패했는데 말로만 "됐습니다"라고 하는 사고를 막기 위한 운영 절차다.

Mark는 Slack에서 대표님(teddy)과 주로 대화하며, Agentree의 강의/데모/업무 자동화/멀티 에이전트 운영을 지원한다. 따라서 이 루프는 Mark를 대표님 전용 실행형 에이전트로 점점 맞춤화하는 데 목적이 있다.

## When to Use

사용할 때:
- 같은 다단계 절차를 2회 이상 반복했거나 앞으로 반복될 가능성이 높을 때
- 5개 이상 도구 호출로 까다로운 문제를 해결했고, 다음에도 같은 절차가 유용할 때
- Agentree 업무, Hermes 운영, Slack 전달, 데모 구성, 멀티 에이전트 협업 같은 반복 운영 패턴을 발견했을 때
- 사용자가 같은 유형의 요청을 반복하거나, 매번 같은 배경 설명을 요구할 때
- 로드한 스킬이 낡았거나 틀렸거나, 이번 작업 중 빠진 단계가 발견됐을 때
- 기존 스킬보다 더 좋은 명령, 경로, 검증법, 안전 원칙을 발견했을 때

사용하지 말 것:
- 단발성 작업이고 다음에 다시 쓸 가능성이 낮을 때
- 이미 같은 목적의 스킬이 있으면 새 스킬을 만들지 말고 기존 스킬을 patch한다.
- 일시적 작업 상태, PR 번호, 이슈 번호, 완료 로그, 날짜가 지나면 낡을 정보는 memory/skill에 넣지 않는다.
- 코드 저장소 자체의 README, CLAUDE.md, git history가 이미 잘 기록하는 프로젝트 내부 사실을 중복 저장하지 않는다.

## 불변 원칙

1. **새 스킬 생성은 사람 확인 후.** 스킬은 장기 자산이므로 Mark가 혼자 남발하지 않는다. 단, 기존 스킬의 작은 오류 수정이나 누락된 pitfall 추가는 즉시 patch할 수 있다.
2. **검증 없는 완료 보고 금지.** 파일을 만들거나 고친 뒤에는 `ls/head/wc` 등으로 실제 디스크 상태를 확인한다.
3. **중복보다 확장 우선.** 비슷한 스킬이 있으면 새로 만들지 말고 기존 스킬을 확장한다.
4. **외부행동과 파괴적 명령은 별도 확인.** approval 설정이 off여도 Slack 발송, 메일 발송, 예약, 제출, 결제, 대량 삭제, 강제 reset은 대표님에게 먼저 확인한다.
5. **막히면 반복하지 않는다.** 쓰기/수정이 막히면 `hermes-write-permission-recovery`를 열고 approval/config 문제를 한 번 진단한 뒤 멈춘다.

## 루프 5단계

### 1. Detect — 스킬감 감지

다음 신호가 있으면 스킬 후보로 표시한다.

- "이 절차를 다음에도 또 설명해야 할 것 같다."
- "대표님 환경에서만 통하는 경로/명령/순서가 있다."
- "일반 지식으로는 부족하고 실제 시행착오로 얻은 방법이 있다."
- "기존 스킬을 로드했는데 빠진 pitfall 때문에 시간을 썼다."
- "Agentree 업무 방식이나 Slack 운영 관례가 반복된다."

과거 반복 패턴을 확인할 때는 `session_search`를 사용한다. 단, session_search 결과를 그대로 memory/skill에 덤프하지 말고, 반복 가능한 절차와 원칙만 요약한다.

### 2. Propose — 대표님께 한 줄 제안

새 스킬 생성은 대표님께 짧게 묻는다.

예시:

```text
대표님, 이건 "Agentree 강의 데모 준비" 스킬감인데 박을까요?
```

좋은 제안은 짧고 판단 가능해야 한다.

- 어떤 스킬인지 한 줄로 말한다.
- 왜 필요한지 장황하게 설명하지 않는다.
- yes/no로 답할 수 있게 한다.

기존 스킬의 오타, 잘못된 명령, 빠진 검증 단계, 새 pitfall 추가는 별도 확인 없이 즉시 patch한다. 스킬 품질 저하는 장기 부채가 되기 때문이다.

### 3. Create or Patch — 생성 또는 수정

새 스킬을 만들 때는 `hermes-agent-skill-authoring` 형식을 따른다.

권장 위치:

```text
~/.hermes/skills/<category>/<skill-name>/SKILL.md
```

Mark의 현재 Windows 경로 예시:

```text
C:/Users/marke/AppData/Local/hermes/skills/software-development/<skill-name>/SKILL.md
```

frontmatter 규칙:

```yaml
---
name: lowercase-hyphen-name
description: "Use when ..."
version: 1.0.0
author: Mark (for teddy / Agentree)
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [short, useful, tags]
    related_skills: [related-skill]
---
```

본문 구조:

```markdown
# Title

## Overview

## When to Use

## Procedure / Workflow

## Common Pitfalls

## Verification Checklist
```

스킬은 실행 가능한 절차여야 한다. "잘한다", "주의한다" 같은 추상 문장보다 실제 명령, 경로, 검증법, 실패 시 대처를 적는다.

### 4. Verify on Disk — 디스크 검증

생성 또는 patch 직후, 보고하기 전에 반드시 디스크에서 확인한다.

```bash
ls -la "$HOME/AppData/Local/hermes/skills/<category>/<skill-name>/SKILL.md"
head -12 "$HOME/AppData/Local/hermes/skills/<category>/<skill-name>/SKILL.md"
wc -c "$HOME/AppData/Local/hermes/skills/<category>/<skill-name>/SKILL.md"
```

세 가지가 모두 통과해야 한다.

- `ls -la`: 파일 존재와 크기 확인
- `head -12`: byte 0 frontmatter가 `---`로 시작하는지 확인
- `wc -c`: 내용이 비어 있지 않고 적정 크기인지 확인

현재 세션의 `skill_view`나 `skills_list`는 새로 만든 스킬을 즉시 못 볼 수 있다. 스킬 로더가 세션 시작 시 캐시되기 때문이다. 따라서 방금 생성/수정한 스킬 검증은 `skill_view`가 아니라 디스크 검증으로 한다.

### 5. Maintain — 유지보수

스킬은 한 번 만들고 끝이 아니다.

- 로드한 스킬이 틀렸으면 즉시 patch한다.
- 새로 발견한 pitfall은 Common Pitfalls에 추가한다.
- 잘못된 명령이나 오래된 경로는 고친다.
- 더 큰 우산 스킬로 흡수할 수 있으면 중복 스킬을 만들지 않는다.
- patch 후에도 4단계 디스크 검증을 반복한다.

## Agentree 에이전트 간 스킬 공유

Mark, Judy, Aizen처럼 서로 다른 컴퓨터에서 도는 에이전트들은 공용 GitHub 저장소를 통해 스킬을 공유할 수 있다. 현재 Agentree 공용 스킬 저장소는 `https://github.com/foresightvalue-create/Skills` (`foresightvalue-create/Skills`)이다. 세부 절차와 안전 규칙은 `references/agentree-shared-skill-exchange.md`를 참조한다.

공유 원칙:
- 로컬에서 생성/patch한 스킬은 먼저 디스크 검증을 끝낸다.
- 공용 repo에 올리기 전에는 공유 범위를 확인한다.
- 다른 에이전트는 공용 repo의 스킬을 **자동 설치하지 않고**, 설치/업데이트 후보로 제안한 뒤 각자 환경에 맞게 현지화한다.
- `SKILL.md`는 class-level 절차를 유지하고, 세션별 상세·repo별 운영 기록은 `references/`에 둔다.

## 주간 스킬 회고 cron

Mark는 주 1회 최근 세션을 돌아보고 스킬 후보를 제안한다. 이 cron의 역할은 **자동 생성이 아니라 제안**이다.

동작:
- 최근 7일 세션에서 반복된 다단계 절차를 찾는다.
- 5개 이상 도구 호출로 해결한 까다로운 문제를 찾는다.
- 이미 스킬로 존재하는지 확인한다.
- 후보가 있으면 2~4개만 대표님께 한 줄 제안한다.
- 후보가 없으면 "이번 주 새 스킬감 없음" 한 줄만 보낸다.

금지:
- cron이 자동으로 새 스킬을 만들지 않는다.
- 오래된 작업 완료 로그를 memory에 저장하지 않는다.
- 대표님에게 매주 장문 보고를 보내지 않는다.

## Mark용 안전 운영

Mark의 자기진화 루프는 실용적이어야 한다. 귀찮은 알림, 중복 스킬, 잘못된 기억이 쌓이면 오히려 성능이 떨어진다.

따라서:
- 주간 회고는 낮은 빈도로 유지한다.
- 후보는 최대 2~4개로 제한한다.
- "이번 주 새 스킬감 없음"도 정상 결과로 인정한다.
- 스킬 생성은 대표님 승인 후 별도 세션/턴에서 진행한다.
- 작은 patch는 조용히 수행하되, 검증 결과는 간단히 보고한다.

## Common Pitfalls

1. **모델 자체 진화로 오해.** 이 루프는 가중치 학습이 아니라 절차/운영 지식의 영속화다.
2. **검증 없이 완료 보고.** 가장 치명적이다. 파일이 없으면 진화도 없다.
3. **스킬 남발.** 작은 일회성 팁을 모두 스킬로 만들면 다음 세션의 노이즈가 된다.
4. **중복 스킬 생성.** 비슷한 스킬이 있으면 patch한다.
5. **장기 memory에 task log 저장.** 날짜가 지나면 낡는 정보는 memory가 아니라 세션 검색에 맡긴다.
6. **cron이 자동 생성.** 주간 cron은 제안만 한다. 생성은 사람 yes 후에 한다.
7. **Slack 발송을 내부 작업으로 오해.** 명시된 대상 채널로 보내는 외부행동은 별도 확인한다. 단, cron의 origin 전달처럼 사용자가 승인한 루틴은 예외다.
8. **Windows에서 PowerShell 문법 사용.** Mark의 terminal은 bash이므로 `$HOME`, `sed`, `grep` 같은 POSIX 문법을 사용한다.
9. **approval 설정만 믿기.** approval off여도 위험 작업은 사람 확인 원칙을 지킨다.

## Verification Checklist

- [ ] 새 스킬 생성 전 대표님에게 한 줄 제안을 했고 승인을 받았다.
- [ ] 기존 스킬이 있으면 새로 만들지 않고 patch를 검토했다.
- [ ] frontmatter가 byte 0 `---`로 시작한다.
- [ ] description은 1024자 이하이고 `Use when`으로 시작한다.
- [ ] `author: Mark (for teddy / Agentree)`로 현지화했다.
- [ ] `platforms: [windows]` 또는 실제 지원 플랫폼을 반영했다.
- [ ] `ls -la`로 파일 존재와 크기를 확인했다.
- [ ] `head -12`로 frontmatter를 확인했다.
- [ ] `wc -c`로 비어 있지 않음을 확인했다.
- [ ] cron은 자동 생성이 아니라 제안만 하도록 되어 있다.
- [ ] 검증 통과 후에만 대표님께 완료를 보고했다.
