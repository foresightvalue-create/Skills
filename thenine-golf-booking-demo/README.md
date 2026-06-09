# 더나인GC 고속 예약 자동화

목표: 보이는 마우스 조작을 최소화하고, Playwright DOM/CDP 제어로 더나인GC 예약 후보 탐색과 최종 승인 직전 확인까지 빠르게 수행합니다.

## 포함 파일

- `SKILL.md` — Hermes/Agentree 에이전트용 절차 스킬
- `scripts/thenine-fast-booking.mjs` — Playwright/CDP 자동화 스크립트
- `scripts/package.json`, `scripts/package-lock.json` — Node 실행 환경

## 모드

- `doctor`: Node/Playwright/Chrome 환경 확인
- `login`: 전용 브라우저 프로필을 띄워 사용자가 직접 로그인. 쿠키/세션은 로컬 프로필에 저장됩니다.
- `plan`: 지정 조건을 JSON으로 정리하고 안전 경계를 출력합니다.
- `dry-run`: 예약 사이트까지 이동하고 스크린샷/HTML 후보를 저장합니다. 최종 예약 확정 버튼은 누르지 않습니다.
- `cdp-start`: 실제 Chrome을 remote debugging 포트로 실행합니다.
- `cdp-doctor`: CDP 연결과 탭 상태를 확인합니다.
- `cdp-dry-run`: CDP Chrome에 연결해 빠르게 예약 페이지 신호를 확인합니다.
- `cdp-show`: 보이는 Chrome에서 날짜/시간 선택 후 `03. 예약확인`까지 표시하고, Slack/Telegram에 보낼 승인 질문 메시지(`approval.messageKo`)를 생성합니다.

## 실행

```bash
cd scripts
npm install
npm run doctor
npm run cdp-start
npm run cdp-doctor
npm run cdp-show -- --date 2026-06-15 --holes 18 --prefer cheapest-latest --step-ms 700
```

## 안전 규칙

- 시간표 행의 `예약` 버튼은 `03. 예약확인`을 표시하기 위한 선택 단계입니다.
- 최종 `예약하기`, `결제`, `확정`, `제출` 류의 버튼은 명시적 사용자 승인 전에는 자동 클릭하지 않습니다.
- `cdp-show`는 `03. 예약확인` 내역을 마스킹해서 요약하고 “이 내역으로 예약을 확정할까요?”라고 묻는 메시지를 생성합니다.
- 이름/연락처 등 개인정보는 콘솔 요약에서 마스킹하고, `03. 예약확인` 단계의 스크린샷/HTML은 저장하지 않습니다.
- 로그인은 사용자가 브라우저에서 직접 합니다.
- 비밀번호/개인정보는 파일·스킬·메모리에 저장하지 않습니다.
- 예약 완료 후 `동반자입력` 단계가 별도인지 확인합니다.
