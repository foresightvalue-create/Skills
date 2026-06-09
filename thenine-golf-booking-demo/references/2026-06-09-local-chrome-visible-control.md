# 2026-06-09 Local Chrome Visible-Control Notes

Context: 대표님 corrected that the previous browser demo was not visible on the monitor. The internal Hermes browser session is insufficient for this demo class; the demo must happen in the user's real local Chrome window.

## Durable workflow lesson

For live 더나인GC booking demos, start by opening or bringing forward **local Windows Chrome**, not the internal browser. Verify visibility with a screenshot of the local desktop before continuing.

## Practical visible-control sequence

1. Launch Chrome locally:

```bash
'/c/Program Files/Google/Chrome/Application/chrome.exe' --new-window 'https://search.naver.com/search.naver?query=%EB%8D%94%EB%82%98%EC%9D%B8%20%EA%B3%A8%ED%94%84%ED%81%B4%EB%9F%BD'
```

2. If direct foregrounding is unreliable, use `uv run --with pyautogui --with pillow python` for temporary local-screen automation rather than permanently installing packages.

3. Before clicking through the demo, capture the real screen:

```python
import pyautogui
img = pyautogui.screenshot()
img.save(r'C:\Users\marke\AppData\Local\Temp\thenine_screen.png')
```

4. If Chrome is running but not visible, enumerate window titles/rectangles via Windows APIs or PowerShell. Watch for off-screen/secondary-monitor coordinates such as negative `left/top` values.

5. If Chrome is on an off-screen or secondary monitor, move it into the visible primary monitor with `MoveWindow`/`SetWindowPos`, then verify with another screenshot.

6. Avoid sending explanatory Telegram/Slack messages while trying to manipulate the browser: the messaging app may steal focus and cover Chrome. Minimize messaging windows before the visible demo flow.

## Pitfalls observed

- A Chrome process existing is not enough; it may be behind Telegram, minimized, or on another monitor.
- Clicking the taskbar by approximate coordinates can open Start or the wrong app; verify via screenshot.
- `Alt+Tab` and `AppActivate` may not bring Chrome forward if another app is stealing focus.
- Do not continue narrating in chat once the user says the browser is stuck; first stabilize the visible browser window, then proceed.
