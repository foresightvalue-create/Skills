---
name: thenine-gc-fast-booking
description: "Fast The Nine GC booking automation using a dedicated Playwright Chrome profile. Use to avoid slow visible mouse demos while preserving final-booking safety boundaries."
version: 0.1.0
author: Mark for teddy / Agentree
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [golf, booking, playwright, browser, automation, theninegc]
    related_skills: [web-booking-automation, google-workspace]
---

# 더나인GC 고속 예약 자동화

Use this skill when the user asks to book/search The Nine GC (더나인GC) quickly, especially after visible mouse-control demos feel too slow.

## Core Idea

Do **not** animate every mouse movement. Use a dedicated Playwright-controlled Chrome profile for speed, and only show the final important browser state when demo visibility matters.

- Slow demo mode: pyautogui/mouse movement in visible Chrome.
- Fast visible mode: Playwright/CDP controls the visible Chrome page directly. Do not animate the mouse, but the browser must visibly change pages, select dates, scroll, and highlight the chosen row so the audience can follow.
- Invisible fast mode: Playwright DOM/CDP control with a persistent local profile for non-demo background extraction.
- Safety boundary: stop before binding actions such as `예약하기`, `결제`, `확정`, `제출` unless the user explicitly approves.

## Existing Workspace

The fast-booking scaffold exists here on Mark's Windows host:

```bash
cd ~/Agentree/booking-automation/thenine-gc
```

Important files:

- `package.json` — Node/Playwright dependencies and scripts
- `thenine-fast-booking.mjs` — safe-by-default automation helper
- `.chrome-profile/` — dedicated browser profile for reusable login session
- `out/` — screenshots and HTML evidence from dry-runs

## Commands

Basic persistent Playwright mode:

```bash
cd ~/Agentree/booking-automation/thenine-gc
npm install
npm run doctor
npm run login
node thenine-fast-booking.mjs dry-run --date 2026-06-15 --holes 18 --prefer cheapest-latest --visible false
```

Preferred fast CDP mode:

```bash
cd ~/Agentree/booking-automation/thenine-gc
npm run cdp-start
npm run cdp-doctor
node thenine-fast-booking.mjs cdp-dry-run --date 2026-06-15 --holes 18 --prefer cheapest-latest
```

Preferred live-demo mode: visible screen changes, no mouse animation:

```bash
cd ~/Agentree/booking-automation/thenine-gc
npm run cdp-show -- --date 2026-06-15 --holes 18 --prefer cheapest-latest --step-ms 900
```

Modes:

- `doctor`: prints Node/Playwright/profile/output path and safety config.
- `login`: opens a visible dedicated Chrome profile so the user can log in manually. Keep credentials out of chat and memory.
- `plan`: prints the requested booking strategy.
- `dry-run`: navigates to the site/booking area, saves screenshot + HTML, extracts visible text/time/price/button signals, and reports whether login is needed. It does **not** click final booking/submit/payment buttons.
- `cdp-start`: launches real Chrome with `--remote-debugging-port=9222` and a dedicated `.cdp-chrome-profile`.
- `cdp-doctor`: verifies Playwright/CDP can connect to `http://127.0.0.1:9222` and lists tabs.
- `cdp-dry-run`: connects via `chromium.connectOverCDP`, navigates/extracts evidence quickly, and keeps the CDP Chrome open by default for visible login/session continuity.
- `cdp-show`: live-demo mode. Brings the CDP Chrome tab to front, visibly navigates to the site, opens booking, selects the requested date, scrolls to the course/time table, clicks the selected row-level `예약` button so `03. 예약확인` appears, then stops before final `예약하기` / confirmation. It also outputs `approval.messageKo`: a Slack/Telegram-ready Korean summary of the redacted `03. 예약확인` details ending with “이 내역으로 예약을 확정할까요?” and requiring the explicit reply `예약 확정`. It must not save screenshots/HTML at the `03. 예약확인` stage because that view contains personal information; redact name/phone in console summaries.

## Verified Environment

As of 2026-06-09 on Mark's Windows host:

- Node: `v24.15.0`
- npm: `11.12.1`
- uv: installed
- Hermes MCP list shows Playwright MCP enabled.
- Chrome executable found at `C:/Program Files/Google/Chrome/Application/chrome.exe`.
- `npm install`, `npm run doctor`, and `npm run plan` succeeded.
- Basic headless dry-run reached The Nine GC, clicked `BOOKING`, saved evidence under `out/`, and reported `manual_login_needed` for the dedicated profile.
- CDP mode verified: `node thenine-fast-booking.mjs cdp-start` launched Chrome on `http://127.0.0.1:9222`; `npm run cdp-doctor` reported `cdp_ready` with `Chrome/149.0.7827.102`; `cdp-dry-run` connected through `chromium.connectOverCDP`, clicked `BOOKING`, saved screenshot/HTML evidence, and kept Chrome open by default.

## Workflow

1. Load `web-booking-automation` and this skill.
2. If the dedicated profile is not logged in, run:

   ```bash
   cd ~/Agentree/booking-automation/thenine-gc
   npm run login
   ```

   Ask the user to log in directly in the opened browser. Do not request/store passwords.

3. Run a fast dry-run:

   ```bash
   node thenine-fast-booking.mjs dry-run --date YYYY-MM-DD --holes 18 --prefer cheapest-latest --visible false
   ```

4. Inspect JSON output, evidence screenshot, and HTML. If logged in, extend or use selector mapping to choose the requested date/slot.
5. Stop at `03. 예약확인`, summarize the redacted confirmation details, and send the Slack/Telegram-ready `approval.messageKo` to the user. The message must end by asking: “이 내역으로 예약을 확정할까요?”
6. Wait for explicit approval such as `예약 확정`. Do not treat vague acknowledgements as approval.
7. Only after explicit approval, perform the scoped final `예약하기` action.
8. After completion, verify confirmation and use `google-workspace` to create a Calendar event.
9. Check for a separate `동반자입력` step; do not assume companion info was recorded.

## Implementation Notes

- The helper blocks final/binding action text matching `/예약하기|결제|확정|제출|구매|신청완료|예약완료/i` in safe click helpers.
- Use the dedicated profile, not the user's ordinary Chrome default profile, to avoid locked-profile issues and accidental credential exposure.
- For audience demos, use `--visible true` only at key transitions. For speed, use `--visible false` or keep visible browser manipulation minimal.
- The current scaffold extracts general booking signals. For true one-click speed, add exact selectors/network parsing after logging in and capturing the booking page HTML.

## Pitfalls

- Existing normal Chrome did not expose remote debugging ports 9222/9223, so attaching to the current user Chrome was not available. Use the dedicated persistent Playwright profile instead.
- First run needs manual login because the dedicated profile has no cookies yet.
- Website HTML/selectors may change; always verify evidence before confirming a selected slot.
- When building button inventories, keep DOM indices stable. A bug occurred when visible elements were filtered before using `locator(...).nth(i)`, causing the script to click a hidden popup link instead of `BOOKING`. Prefer DOM-side `element.click()` on the found element or preserve original `domIndex`.
- After login, date selection can call the site function directly, e.g. `Date_Click('2026','06','15')`, then extract table rows matching `time + green fee + 예약`. For 2026-06-15 verification, rows showed 18-hole 1부/2부 and 9-hole 3부 separately; do not mix 9-hole 55,000원 slots into 18-hole comparisons.
- For live demos, selecting a row-level `예약` button such as `goSend(frmSend,'20260615','1','','0607','1')` is the step that populates `03. 예약확인`; the binding/final step is the later `예약하기` button such as `goSend0(...)`. Show `03. 예약확인`, then stop.
- Do not save screenshots or HTML after `03. 예약확인` appears, because that page contains account PII. Console previews must redact name/phone.
- Do not automate captcha/2FA. Pause for user input.
