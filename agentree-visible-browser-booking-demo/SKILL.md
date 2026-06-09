---
name: agentree-visible-browser-booking-demo
description: "Use when Agentree agents such as Mark, Judy, or Aizen must perform a reservation/booking demo in a browser that is visibly shown on the user's monitor, especially when prior agents used hidden/headless browser tools or stopped at login instead of reaching the correct safety boundary."
version: 1.0.0
author: Mark (for teddy / Agentree)
license: MIT
platforms: [windows, macos]
metadata:
  hermes:
    tags: [agentree, browser, booking, reservation, visible-demo, chrome, credentials, safety]
    related_skills: [agentree-self-improving-agent-principles, agentree-shared-skill-exchange]
  agentree:
    scope: shared
    intended_agents: [mark, judy, aizen]
    contains_pii: false
---

# Agentree Visible Browser Booking Demo

## Overview

Use this skill when the user wants the agent to operate a real browser that is visible on the user's monitor, not an internal/headless browser. This commonly comes up in Agentree demos where the point is to show an agent opening Chrome, searching, clicking, logging in when authorized, checking availability, and stopping only at the correct safety boundary.

This skill was created after a golf-booking demo failure pattern: one Mark instance used hidden browser automation instead of opening visible Chrome, and another reached only the login screen because credentials/session state were not shared across agent instances.

The goal is to make all Agentree agents behave consistently:

- If the user says the browser must appear on the monitor, use the local GUI browser.
- If the user expects completion, continue beyond login when credentials/session allow.
- If credentials are missing, say exactly that and ask for user login or one-time credential entry.
- Stop only before irreversible confirmation/payment unless the user explicitly approves that final action.

## When to Use

Use when:

- The user asks to demonstrate a booking/reservation flow live on screen.
- The user complains that the agent "did it alone" without showing a browser.
- The user says the browser did not open on the monitor.
- A booking site requires login and the agent stops too early at the login page.
- Mark/Judy/Aizen need to reproduce a visible browser workflow from another machine.
- The task involves golf tee-time booking, restaurant reservation, tickets, appointment booking, or checkout-like flows.

Do not use this skill to store credentials, resident-registration numbers, card details, passwords, or one-off reservation results.

## Critical Distinctions

### Hidden browser vs visible browser

Internal browser tools are useful for analysis, but they are not necessarily visible to the user or an audience. If the user's goal is a live demo, text-only or hidden browser automation fails the task even if the website was technically navigated.

Ask this operational question before starting:

```text
Is the browser interaction supposed to be visible on the user's monitor/audience screen?
```

If yes, use a local desktop automation path.

### Shared skills vs shared credentials

Skills, memories, and cron jobs may be shared within a profile or through GitHub, but login credentials/cookies usually are **not** shared across:

- Slack session vs Telegram session;
- different Hermes profiles;
- different computers;
- Mark vs Judy vs Aizen;
- Hermes vs OpenClaw based agents;
- different Chrome user-data profiles.

Therefore, if another agent reaches only the login screen, do not assume it is lazy. It may simply lack the browser session/cookies or credentials.

Correct response:

```text
I reached the login boundary. To continue, please either log in directly in the visible browser or authorize one-time credential entry. I will not save the password in memory or skills.
```

## Windows Visible Chrome Procedure

### 1. Launch or activate Chrome visibly

On Windows Mark, Chrome path is typically:

```text
C:/Program Files/Google/Chrome/Application/chrome.exe
```

Use local GUI automation such as `pyautogui`, `pygetwindow`, and screenshots. In Hermes on Windows, a temporary dependency pattern is:

```bash
uv run --with pyautogui --with pygetwindow --with pillow python script.py
```

Do not rely solely on the internal browser tool when visibility is required.

### 2. Verify the current visible screen

After each major step:

1. Bring Chrome to the foreground.
2. Save a screenshot using a native path such as `C:\\Users\\<user>\\AppData\\Local\\Temp\\...png`.
3. Analyze the screenshot.
4. If the user says the screen differs, trust the user and recapture.
5. Check for leftover popup windows, notice tabs, or unrelated Slack/OS toast notifications.

### 3. Use practical speed

The user prefers practical, human-fast operation, not slow tutorial movement.

Recommended speed policy:

- Search/navigation/clicking: fast, around 8x+ compared with slow demo mode.
- Cursor movement: short and purposeful; no excessive theatrical motion.
- Page loads: wait only as needed, then verify by screenshot/DOM/state.
- Final action boundary: slow down and pause clearly before booking/payment/final submission.

### 4. Handle popups and notice tabs

Korean booking sites often open multiple notices. Clean them before continuing:

- close all modal popups;
- close separate notice tabs/windows;
- close or ignore unrelated app notifications only after identifying them;
- verify with window list and screenshot before claiming the page is clean.

### 5. Login boundary handling

If the site requires login:

- First check whether the visible browser already has a logged-in session.
- If not logged in, ask the user to log in directly or explicitly authorize one-time credential entry.
- Never save credentials in memory, skills, repo files, screenshots notes, or final summaries.
- Do not assume Slack Mark credentials are available to Telegram Mark or another machine.

### 6. Continue after login

After login succeeds:

- return to the booking page;
- reselect date/time if the site reset the calendar;
- continue availability search;
- pick the best matching candidate;
- proceed to the review/final-confirmation screen if permitted.

Do not stop at login merely because login was required. Login is a checkpoint, not the final goal.

## Golf Booking Pattern

For golf tee-time demos:

1. Confirm course, date range, time window, party size, holes.
2. Open visible browser.
3. Search and enter official site or booking page.
4. Close notice popups/tabs.
5. Open booking/reservation calendar.
6. If login required, pause for user login or one-time credential authorization.
7. After login, inspect the requested date range.
8. Select candidate tee time matching date/time/party/hole constraints.
9. Go to the final review screen.
10. Stop before `예약하기`, `결제`, `확정`, `제출`, or equivalent unless the user explicitly approves that final action.
11. After final approval, click only the scoped final action and report real confirmation evidence.

## Credential and PII Rules

Never share or store:

- resident-registration numbers;
- phone numbers as reusable identity data;
- card numbers;
- expiry dates;
- CVC;
- card PIN/password;
- website passwords;
- raw cookies/session tokens.

For demos, prefer:

- user logs in directly in the visible browser;
- temporary/demo accounts;
- browser profile with pre-existing login session;
- agent enters credentials only once when explicitly authorized, without saving them.

Skills should record that credentials were needed, not the values.

## Cross-Agent Setup Notes

If Telegram Mark, Slack Mark, Judy, or Aizen need consistent behavior:

1. Pull shared skills from `https://github.com/foresightvalue-create/Skills`.
2. Ensure this skill is installed or copied into the agent's skills directory.
3. Restart/reset the session so the skill loader sees it.
4. Confirm whether the agent can control a visible browser on that machine.
5. Confirm whether the browser profile is already logged into the target site.
6. If not, ask the user to log in once or provide a safe demo account.

If the agent is running on a server/headless environment, it cannot satisfy a monitor-visible demo unless it controls the user's desktop through a remote GUI mechanism.

## Failure Messages to Use

If hidden browser was used by mistake:

```text
I navigated the site, but not in the browser visible on your monitor. For this demo I need to switch to local visible Chrome control.
```

If login is missing:

```text
I reached the login boundary, but this agent does not have the saved session or credentials. Please log in in the visible browser or authorize one-time credential entry. I will not store the credentials.
```

If final confirmation is reached:

```text
I reached the final reservation confirmation boundary. The next button appears to create the actual booking, so I will pause unless you explicitly approve final confirmation.
```

## Common Pitfalls

1. **Using hidden browser tools for a visible demo.** This fails the user's actual requirement.
2. **Assuming credentials are shared.** They are not shared across agents/computers/profiles by default.
3. **Stopping at login after the user expected end-to-end progress.** Login is a checkpoint; continue after login if authorized.
4. **Saving private values into skills.** Skills must contain procedures only.
5. **Claiming popups are closed from stale screenshots.** Recapture the current visible screen.
6. **Moving too slowly.** Use practical speed; slow down only at safety boundaries.
7. **Clicking final booking/payment without scoped approval.** Even a true agent respects irreversible-action boundaries.

## Verification Checklist

- [ ] Confirmed whether visible monitor browser operation is required.
- [ ] Used local GUI browser control when visibility was required.
- [ ] Verified current screen with a fresh screenshot.
- [ ] Closed website popups/notice tabs and unrelated OS/app notifications as needed.
- [ ] Confirmed login/session availability instead of assuming credentials are shared.
- [ ] Continued after login when authorized.
- [ ] Reached either real completion or a clear safety/approval boundary.
- [ ] Did not save credentials or sensitive personal/payment data.
- [ ] Captured reusable lessons in skills and pushed shared procedures when appropriate.
