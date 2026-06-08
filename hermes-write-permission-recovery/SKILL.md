---
name: hermes-write-permission-recovery
description: "Use when Hermes Slack/Telegram/Discord gateway sessions cannot read, write, edit files, or create skills because command approval mode blocks tool execution. Diagnose approvals.mode first, avoid settings.json rabbit holes, and stop after one blocked attempt."
version: 1.0.0
author: Mark (for teddy / Agentree)
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [hermes, permissions, approvals, self-evolution, troubleshooting, recovery, config, slack]
    related_skills: [hermes-agent]
---

# Hermes 쓰기 권한 복구 — Mark 버전

## Overview

Hermes 게이트웨이 세션(Slack, Telegram, Discord 등)에서 파일 쓰기, 파일 수정, 스킬 생성, 일부 읽기 명령이 멈추거나 실패할 때 쓰는 복구 절차다. 이 스킬의 목적은 원인을 추측하며 같은 쓰기를 반복하지 않고, `~/.hermes/config.yaml`의 `approvals.mode`를 먼저 확인해 빠르게 진단하는 것이다.

Mark는 Slack에서 대표님(teddy)과 주로 대화한다. Slack 세션에는 CLI처럼 승인 프롬프트를 누르는 UI가 없을 수 있으므로, approval 설정이 `manual`이면 자기진화 루프(스킬 생성/수정)가 막힐 수 있다.

## When to Use

사용할 때:
- Slack/Telegram/Discord 게이트웨이 세션에서 Write/Edit/Read/skill_manage가 멈추거나 반복 실패할 때
- 스킬 생성이 안 되는데 원인이 권한인지, 파일 경로인지, 스킬 포맷인지 불분명할 때
- `hermes config`, 파일 읽기, 파일 쓰기까지 승인 대기로 막히는 듯한 증상이 있을 때
- 자기진화 루프를 설치하거나 유지보수하기 전에 쓰기 가능 여부를 확인해야 할 때

사용하지 말 것:
- 단순 YAML 문법 오류, 경로 오타, skill frontmatter 검증 실패가 명확할 때
- 외부 API 장애, 모델 오류, 네트워크 장애가 원인일 때
- 파괴적 명령이나 외부 발송을 승인 없이 진행하기 위한 우회 수단으로 쓰지 말 것

## 확정적으로 먼저 볼 곳

가장 먼저 확인할 곳은 Hermes config의 approval 설정이다.

```bash
hermes config path
hermes config show
```

또는 현재 Windows 호스트의 기본 경로에서 직접 확인한다.

```bash
sed -n '454,459p' "$HOME/AppData/Local/hermes/config.yaml"
```

정상적으로 자기진화 루프를 운영하려면 다음 형태가 권장된다.

```yaml
approvals:
  mode: off
```

주의: `hermes config set approvals.mode off`가 환경에 따라 YAML boolean `false`로 저장될 수 있다. 이 경우 실제 설정 파일에서 `mode: off` 문자열 형태인지 확인한다. 잘못 저장되면 config 파일을 직접 열어 고친다.

## 증상별 진단

### 1. 쓰기/수정만 막힌다

가능성이 높은 원인:
- approvals.mode가 manual 또는 smart라서 게이트웨이 세션에서 승인 대기를 하고 있음
- 경로가 Hermes 허용 디렉터리 밖임
- 스킬 이름/카테고리 충돌 또는 frontmatter 오류

처리:
1. config의 `approvals.mode`를 확인한다.
2. `manual`이면 대표님 승인 하에 `off`로 변경한다.
3. 같은 쓰기를 여러 번 반복하지 않는다.

### 2. 읽기 명령까지 막힌다

이 경우 파일 권한이나 스킬 포맷 문제가 아니라 approval 레이어 문제일 가능성이 높다. Slack 같은 게이트웨이 세션에는 승인 UI가 없기 때문에, 승인 대기 상태가 사실상 영구 대기처럼 보일 수 있다.

### 3. `settings.json`을 바꾸고 싶어진다

헛다리일 가능성이 높다. Claude 계열 도구의 `~/.claude/settings.json` 권한 설정은 Hermes Agent의 게이트웨이 approval 문제의 주 원인이 아니다. Hermes는 Hermes config를 먼저 본다.

## 복구 절차

대표님이 자기진화 루프 설치/운영을 승인한 경우:

```bash
hermes config set approvals.mode off
```

그 후 반드시 실제 파일을 확인한다.

```bash
sed -n '454,459p' "$HOME/AppData/Local/hermes/config.yaml"
```

`mode: off`가 보이면 통과다. 만약 `mode: false`, `mode: '"off"'`, `mode: '''off'''`처럼 저장되면 문자열 파싱 문제가 생긴 것이므로 config 파일을 직접 열어 `mode: off`로 고친다.

게이트웨이 프로세스가 이미 떠 있다면 변경사항은 새 세션 또는 gateway restart 후 완전히 반영된다. 단, Slack 응답 중에 gateway를 즉시 재시작하면 현재 응답이 끊길 수 있으므로, 작업이 끝난 뒤 재시작하거나 사용자에게 재시작 타이밍을 안내한다.

## 안전 원칙

`approvals.mode: off`는 내부 자동화에는 유용하지만 안전망을 줄인다. 따라서 Mark는 다음 원칙을 지킨다.

- 외부 발송(메일, Slack 채널 발송, 트윗, 제출, 예약, 결제)은 대표님에게 먼저 확인한다.
- 파괴적 명령(`rm -rf`, 대량 삭제, git reset --hard, 대량 덮어쓰기)은 대표님에게 먼저 확인한다.
- 내부 읽기, 스킬 생성, 스킬 patch, 검증용 `ls/head/wc`, cron 목록 확인 같은 가역 작업은 자율 진행할 수 있다.
- 쓰기가 막히면 같은 시도를 반복하지 않는다. 한 번 진단하고, approval 문제면 대표님에게 필요한 조치를 한 번만 요청한다.

## Mark 환경 메모

현재 Mark는 Windows 호스트에서 Slack DM으로 대표님과 대화한다. 터미널 도구는 PowerShell이 아니라 Git Bash/MSYS 스타일 bash를 사용한다.

권장 경로 표기:

```bash
$HOME/AppData/Local/hermes/config.yaml
$HOME/AppData/Local/hermes/skills/software-development/<skill-name>/SKILL.md
```

Windows 네이티브 경로도 동작한다.

```text
C:/Users/marke/AppData/Local/hermes/config.yaml
```

## Common Pitfalls

1. **같은 쓰기 반복 시도.** 권한 대기라면 반복해도 해결되지 않는다. 한 번 진단하고 멈춘다.
2. **`settings.json`부터 보는 것.** Hermes approval 문제는 Hermes config가 우선이다.
3. **`off`를 boolean false로 저장.** config setter가 YAML 값을 해석할 수 있으므로 실제 파일을 확인한다.
4. **gateway restart를 작업 중간에 실행.** 현재 Slack 응답이 끊길 수 있다. 가능하면 검증과 보고 후 재시작 타이밍을 잡는다.
5. **approval off를 무제한 권한으로 오해.** 외부행동과 파괴적 명령은 여전히 사람 확인이 필요하다.

## Verification Checklist

- [ ] `~/.hermes/config.yaml` 또는 Windows 경로의 config 파일을 확인했다.
- [ ] `approvals.mode`가 `manual`, `smart`, `off` 중 무엇인지 확인했다.
- [ ] 자기진화 루프 운영 승인 후 `mode: off`가 실제 파일에 기록되어 있다.
- [ ] 쓰기 검증을 한 번 실행했다.
- [ ] 외부 발송/파괴적 작업은 별도 확인 원칙을 유지한다.
