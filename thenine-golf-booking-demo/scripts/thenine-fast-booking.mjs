#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const HOME = os.homedir();
const ROOT = path.resolve(HOME, 'Agentree', 'booking-automation', 'thenine-gc');
const PROFILE_DIR = path.resolve(ROOT, '.chrome-profile');
const CDP_PROFILE_DIR = path.resolve(ROOT, '.cdp-chrome-profile');
const OUT_DIR = path.resolve(ROOT, 'out');
const SITE_URL = process.env.THENINE_URL || 'https://www.theninegc.co.kr/';
const CDP_PORT = Number(process.env.THENINE_CDP_PORT || 9222);
const CDP_ENDPOINT = `http://127.0.0.1:${CDP_PORT}`;
const BOOKING_HINTS = ['인터넷예약', '예약', 'BOOKING', 'booking'];
const FINAL_ACTION_RE = /(예약하기|결제|확정|제출|구매|신청완료|예약완료)/i;

function ensureDirs() {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  fs.mkdirSync(CDP_PROFILE_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function findChromeExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
  ].filter(Boolean);
  const hit = candidates.find(p => fs.existsSync(p));
  if (!hit) throw new Error(`Chrome executable not found. Tried: ${candidates.join(', ')}`);
  return hit;
}

async function fetchJson(url, timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function waitForCdp(timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      return await fetchJson(`${CDP_ENDPOINT}/json/version`, 1000);
    } catch (err) {
      lastError = err;
      await new Promise(r => setTimeout(r, 250));
    }
  }
  throw new Error(`CDP endpoint not ready at ${CDP_ENDPOINT}: ${lastError}`);
}

async function connectCdp() {
  await waitForCdp(10000);
  const browser = await chromium.connectOverCDP(CDP_ENDPOINT);
  const context = browser.contexts()[0] || await browser.newContext();
  let page = context.pages().find(p => !p.url().startsWith('chrome://')) || context.pages()[0];
  if (!page) page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(20000);
  return { browser, context, page };
}

async function cdpStart(args) {
  ensureDirs();
  const chrome = findChromeExecutable();
  const startUrl = args.url || SITE_URL;
  const chromeArgs = [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${CDP_PROFILE_DIR}`,
    '--no-first-run',
    '--disable-infobars',
    '--disable-blink-features=AutomationControlled',
    '--start-maximized',
    startUrl,
  ];
  const child = spawn(chrome, chromeArgs, {
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
  });
  child.unref();
  const version = await waitForCdp(15000);
  console.log(JSON.stringify({
    status: 'cdp_chrome_started',
    pid: child.pid,
    chrome,
    endpoint: CDP_ENDPOINT,
    profileDir: CDP_PROFILE_DIR,
    webSocketDebuggerUrl: version.webSocketDebuggerUrl || null,
    instruction_ko: '이 Chrome은 Playwright/CDP가 빠르게 제어할 수 있는 전용 브라우저입니다. 여기서 직접 로그인하면 세션이 전용 프로필에 저장됩니다.',
  }, null, 2));
}

async function cdpDoctor() {
  ensureDirs();
  const version = await waitForCdp(3000);
  const tabs = await fetchJson(`${CDP_ENDPOINT}/json/list`, 3000).catch(() => []);
  console.log(JSON.stringify({
    status: 'cdp_ready',
    endpoint: CDP_ENDPOINT,
    profileDir: CDP_PROFILE_DIR,
    browser: version.Browser || null,
    webSocketDebuggerUrl: version.webSocketDebuggerUrl || null,
    tabCount: Array.isArray(tabs) ? tabs.length : null,
    tabs: Array.isArray(tabs) ? tabs.map(t => ({ title: t.title, url: t.url, type: t.type })).slice(0, 10) : [],
  }, null, 2));
}

async function cdpDryRun(args) {
  const { browser, page } = await connectCdp();
  const nav = await gotoBooking(page);
  const evidence = await saveEvidence(page, 'cdp-booking-page');
  const signals = await extractBookingSignals(page);
  console.log(JSON.stringify({
    status: 'cdp_dry_run_complete',
    endpoint: CDP_ENDPOINT,
    nav,
    requested: { date: args.date || null, holes: args.holes || null, prefer: args.prefer || null },
    evidence,
    signals,
    next: signals.hasLoginText
      ? 'manual_login_needed_in_cdp_chrome: log in directly in the CDP Chrome window, then rerun cdp-dry-run'
      : 'logged_in_or_booking_visible: add/use exact selectors for date/time/price selection; still stop before final reservation confirmation',
    note: boolArg(args.close, false) ? 'CDP Chrome will be closed because --close true was passed.' : 'CDP Chrome is kept open by default so the visible session/login state remains available.',
  }, null, 2));
  if (boolArg(args.close, false)) {
    await browser.close().catch(() => {});
  } else {
    // There is no public Playwright disconnect API for CDP Browser here; exit the node process
    // after printing output so Chrome keeps running on the debugging port.
    setTimeout(() => process.exit(0), 50);
  }
}

async function cdpShow(args) {
  const date = args.date || '2026-06-15';
  const [yyyy, mm, dd] = date.split('-');
  const stepMs = Number(args.stepMs || args['step-ms'] || 700);
  const prefer = args.prefer || 'cheapest-latest';
  const maxOverMin = Number(args.maxOverMin || args['max-over-min'] || 0);
  const { browser, page } = await connectCdp();
  await page.bringToFront();
  await page.evaluate(() => { try { window.focus(); } catch {} });
  await page.waitForTimeout(stepMs);

  // Visible transition 1: home page.
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
  await page.bringToFront();
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await dismissPopups(page);
  await page.waitForTimeout(stepMs);

  // Visible transition 2: booking page. This is DOM click, not mouse movement.
  const nav = await safeClickByText(page, BOOKING_HINTS);
  await page.bringToFront();
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await dismissPopups(page);
  await page.waitForTimeout(stepMs);

  // Visible transition 3: selected date, using site JS directly so the page updates on screen.
  const dateResult = await page.evaluate(({ yyyy, mm, dd }) => {
    if (typeof Date_Click === 'function') {
      Date_Click(yyyy, mm, dd);
      return { method: 'Date_Click', date: `${yyyy}-${mm}-${dd}` };
    }
    const hrefNeedle = `Date_Click('${yyyy}','${mm}','${dd}')`;
    const el = Array.from(document.querySelectorAll('a')).find(a => (a.getAttribute('href') || '').includes(hrefNeedle));
    if (el) { el.click(); return { method: 'anchor.click', date: `${yyyy}-${mm}-${dd}` }; }
    return { method: 'not_found', date: `${yyyy}-${mm}-${dd}` };
  }, { yyyy, mm, dd });
  await page.bringToFront();
  await page.waitForTimeout(stepMs);

  // Visible transition 4: scroll to course/time section, choose the best row,
  // click that row's non-final `예약` button, then stop at 03. 예약확인.
  const extraction = await page.evaluate(({ prefer, maxOverMin }) => {
    const rows = Array.from(document.querySelectorAll('tr')).map((tr, i) => ({
      i,
      el: tr,
      text: tr.innerText.trim().replace(/\s+/g, ' '),
    }));
    let section = 'unknown';
    let timeTableHeaderCount = 0;
    const parsed = [];
    for (const r of rows) {
      // The site renders course section labels outside the <tr> rows, but repeats
      // the header row: first header=1부 18홀, second=2부 18홀, third=3부 9홀.
      if (r.text === '시간 그린피 예약') {
        timeTableHeaderCount += 1;
        section = timeTableHeaderCount === 1 ? '1부(18홀)' : timeTableHeaderCount === 2 ? '2부(18홀)' : '3부(9홀)';
        continue;
      }
      const m = r.text.match(/\b([01]?\d|2[0-3]):[0-5]\d\b.*?([0-9]{1,3}(?:,[0-9]{3})+)원.*?예약/);
      if (m) parsed.push({ rowIndex: r.i, section, time: m[0].match(/\b([01]?\d|2[0-3]):[0-5]\d\b/)[0], priceText: `${m[2]}원`, price: Number(m[2].replace(/,/g, '')), text: r.text });
    }
    const holes18 = parsed.filter(x => /18홀/.test(x.section));
    const minPrice = Math.min(...holes18.map(x => x.price));
    const maxAllowed = prefer === 'latest-within-min-plus' ? minPrice + Number(maxOverMin || 0) : minPrice;
    const candidates = holes18.filter(x => x.price <= maxAllowed).sort((a, b) => a.time.localeCompare(b.time));
    const best = candidates.at(-1) || null;
    const selectionRule = { prefer, minPrice, maxOverMin: Number(maxOverMin || 0), maxAllowed, candidateCount: candidates.length };
    let rowReserveClick = { clicked: false, reason: 'best row not found' };
    if (best) {
      const tr = rows.find(r => r.i === best.rowIndex)?.el;
      if (tr) {
        tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        tr.style.outline = '4px solid #ff3b30';
        tr.style.background = '#fff3cd';
        const btn = tr.querySelector('button');
        if (btn && (btn.innerText || btn.value || '').trim() === '예약') {
          const onclick = btn.getAttribute('onclick');
          btn.click();
          rowReserveClick = { clicked: true, onclick, rowText: tr.innerText.trim().replace(/\s+/g, ' ') };
        } else {
          rowReserveClick = { clicked: false, reason: '예약 button not found in best row', rowText: tr.innerText.trim().replace(/\s+/g, ' ') };
        }
      }
    } else {
      const marker = Array.from(document.querySelectorAll('*')).find(e => /02\. 코스 및 시간 선택/.test(e.innerText || ''));
      marker?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return { parsed, holes18, selectionRule, candidates, best, rowReserveClick };
  }, { prefer, maxOverMin });
  await page.waitForTimeout(stepMs * 2);

  const confirmInfo = await page.evaluate(() => {
    const redact = (s) => s
      .replace(/성명\s*\t?\s*[^\n]+/g, '성명\t[redacted]')
      .replace(/연락처\s*\t?\s*[^\n]+/g, '연락처\t[redacted]')
      .replace(/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/g, '[redacted-phone]');
    const body = document.body.innerText || '';
    const start = body.indexOf('03. 예약확인');
    const preview = start >= 0 ? redact(body.slice(start, start + 900)) : '';
    const finalButtons = Array.from(document.querySelectorAll('a,button,input[type=button],input[type=submit]'))
      .map((el, i) => ({ i, text: (el.innerText || el.value || '').trim().replace(/\s+/g, ' '), href: el.getAttribute('href'), onclick: el.getAttribute('onclick') }))
      .filter(x => /예약하기|결제|확정|제출/.test(x.text || '') || /goSend0/.test(`${x.href || ''} ${x.onclick || ''}`));
    const marker = Array.from(document.querySelectorAll('*')).find(e => /^03\. 예약확인/.test((e.innerText || '').trim()));
    if (marker) marker.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return { has03: start >= 0, preview, finalButtons };
  });
  await page.waitForTimeout(stepMs);

  const requested = { date, holes: args.holes || '18', prefer, maxOverMin: prefer === 'latest-within-min-plus' ? maxOverMin : null };
  const approvalMessageKo = buildApprovalMessageKo({ requested, best: extraction.best, confirmInfo });

  console.log(JSON.stringify({
    status: confirmInfo.has03 ? 'cdp_show_complete_awaiting_user_approval' : 'cdp_show_blocked_before_confirmation',
    mode: confirmInfo.has03 ? 'visible_browser_changes_without_mouse_to_03_confirmation_then_approval_prompt' : 'visible_browser_blocked_before_03_confirmation',
    endpoint: CDP_ENDPOINT,
    nav,
    dateResult,
    requested,
    best: extraction.best,
    selectionRule: extraction.selectionRule,
    candidates: extraction.candidates?.map(x => ({ section: x.section, time: x.time, priceText: x.priceText, price: x.price })).slice(0, 50),
    rowReserveClick: extraction.rowReserveClick,
    confirmInfo,
    approval: {
      channels: ['slack', 'telegram'],
      messageKo: approvalMessageKo,
      requiredUserReply: '예약 확정',
      nextActionAfterApproval: 'Click the final 예약하기 button only after explicit user approval.',
    },
    evidence: null,
    evidenceNote: 'No screenshot/HTML saved at 03. 예약확인 because the page contains personal information.',
    safety: 'Clicked only the row-level 예약 button to display 03. 예약확인; did not click final 예약하기/confirmation. Send approval.messageKo to Slack/Telegram and wait for explicit approval before final 예약하기.',
  }, null, 2));
  if (boolArg(args.close, false)) await browser.close().catch(() => {});
  else setTimeout(() => process.exit(0), 50);
}

function buildApprovalMessageKo({ requested, best, confirmInfo }) {
  if (!confirmInfo?.has03) {
    return [
      '대표님, 더나인GC 예약확인 단계에 아직 도달하지 못했습니다.',
      '',
      '진행 요청 내역',
      `- 예약일자: ${requested.date}`,
      `- 기준: ${requested.holes}홀`,
      `- 선택 기준: ${requested.prefer}`,
      '',
      '현재는 로그인 또는 예약 가능 시간표 확인 단계에서 막힌 상태입니다.',
      '최종 예약하기 버튼은 누르지 않았습니다.'
    ].join('\n');
  }
  const lines = [
    '대표님, 더나인GC 예약확인 단계까지 도달했습니다.',
    '',
    '03. 예약확인 내역',
    `- 예약일자: ${requested.date}`,
    `- 기준: ${requested.holes}홀`,
    `- 선택 기준: ${requested.prefer}`,
  ];
  if (best) {
    lines.push(`- 코스/구분: ${best.section}`);
    lines.push(`- 예약시간: ${best.time}`);
    lines.push(`- 그린피: ${best.priceText}`);
  }
  if (confirmInfo?.preview) {
    lines.push('');
    lines.push('화면 확인 요약:');
    lines.push(confirmInfo.preview.trim());
  }
  lines.push('');
  lines.push('최종 예약하기 버튼은 아직 누르지 않았습니다.');
  lines.push('이 내역으로 예약을 확정할까요?');
  lines.push('확정하려면 “예약 확정”이라고 답해주세요.');
  return lines.join('\n');
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) args[key] = true;
      else args[key] = argv[++i];
    } else args._.push(a);
  }
  return args;
}

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function boolArg(value, defaultValue = true) {
  if (value === undefined) return defaultValue;
  if (value === true || value === 'true' || value === '1' || value === 'yes') return true;
  if (value === false || value === 'false' || value === '0' || value === 'no') return false;
  return defaultValue;
}

async function launchPersistent({ visible = true } = {}) {
  ensureDirs();
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: !visible,
    viewport: null,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--disable-infobars',
    ],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(20000);
  return { ctx, page };
}

async function saveEvidence(page, label) {
  ensureDirs();
  const stamp = `${ts()}-${label}`;
  const screenshot = path.join(OUT_DIR, `${stamp}.png`);
  const html = path.join(OUT_DIR, `${stamp}.html`);
  await page.screenshot({ path: screenshot, fullPage: true }).catch(() => {});
  fs.writeFileSync(html, await page.content(), 'utf8');
  return { screenshot, html };
}

async function buttonInventory(page) {
  return await page.evaluate(() => {
    const visible = (el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0;
    };
    return Array.from(document.querySelectorAll('a,button,input[type=button],input[type=submit],[role=button]'))
      .map((el, domIndex) => ({
        domIndex,
        visible: visible(el),
        tag: el.tagName.toLowerCase(),
        text: (el.innerText || el.value || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 80),
        href: el.href || null,
        id: el.id || null,
        className: (el.className || '').toString().slice(0, 120),
      }))
      .filter(x => x.visible && (x.text || x.href || x.id || x.className))
      .slice(0, 200);
  });
}

async function safeClickByText(page, patterns) {
  const result = await page.evaluate(({ patterns, finalPattern }) => {
    const finalRe = new RegExp(finalPattern, 'i');
    const visible = (el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0;
    };
    const candidates = Array.from(document.querySelectorAll('a,button,input[type=button],input[type=submit],[role=button]'))
      .map((el, domIndex) => ({
        el,
        hit: {
          domIndex,
          tag: el.tagName.toLowerCase(),
          text: (el.innerText || el.value || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 80),
          href: el.href || null,
          id: el.id || null,
          className: (el.className || '').toString().slice(0, 120),
        },
      }))
      .filter(({ el, hit }) => visible(el) && (hit.text || hit.href || hit.id || hit.className));
    const found = candidates.find(({ hit }) => patterns.some(p => (hit.text || '').includes(p) || (hit.href || '').includes(p)));
    if (!found) return { clicked: false, reason: 'no matching visible link/button', candidates: candidates.map(c => c.hit).slice(0, 20) };
    if (finalRe.test(found.hit.text || '')) return { clicked: false, reason: `blocked final/binding action: ${found.hit.text}`, hit: found.hit };
    found.el.click();
    return { clicked: true, hit: found.hit };
  }, { patterns, finalPattern: FINAL_ACTION_RE.source });
  if (result.clicked) await page.waitForTimeout(250);
  return result;
}

async function gotoBooking(page) {
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await dismissPopups(page);
  let res = await safeClickByText(page, BOOKING_HINTS);
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await dismissPopups(page);
  return res;
}

async function dismissPopups(page) {
  const closeWords = ['닫기', '오늘 하루', '오늘하루', 'Close', 'close', '×', 'X'];
  for (let round = 0; round < 3; round++) {
    const clicked = await page.evaluate((closeWords) => {
      const els = Array.from(document.querySelectorAll('button,a,input[type=button],[role=button]'));
      const visible = (el) => {
        const s = getComputedStyle(el); const r = el.getBoundingClientRect();
        return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0;
      };
      const el = els.find(e => visible(e) && closeWords.some(w => ((e.innerText || e.value || e.getAttribute('aria-label') || '').trim()).includes(w)));
      if (el) { el.click(); return true; }
      return false;
    }, closeWords).catch(() => false);
    if (!clicked) break;
    await page.waitForTimeout(250);
  }
}

async function extractBookingSignals(page) {
  const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  const buttons = await buttonInventory(page);
  const prices = Array.from(text.matchAll(/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{5,6})\s*원/g)).map(m => m[0]);
  const times = Array.from(text.matchAll(/\b([01]?\d|2[0-3]):[0-5]\d\b/g)).map(m => m[0]);
  return {
    url: page.url(),
    title: await page.title().catch(() => ''),
    hasLoginText: /로그인|아이디|비밀번호/.test(text),
    hasBookingText: /예약|BOOKING|인터넷예약/.test(text),
    prices: [...new Set(prices)].slice(0, 50),
    times: [...new Set(times)].slice(0, 80),
    buttons: buttons.slice(0, 80),
    bodyPreview: text.slice(0, 1500),
  };
}

async function doctor() {
  ensureDirs();
  const report = {
    node: process.version,
    platform: process.platform,
    root: ROOT,
    profileDir: PROFILE_DIR,
    outDir: OUT_DIR,
    siteUrl: SITE_URL,
    safety: 'final/binding actions matching 예약하기|결제|확정|제출 are blocked in this script',
  };
  console.log(JSON.stringify(report, null, 2));
}

async function login(args) {
  const { ctx, page } = await launchPersistent({ visible: boolArg(args.visible, true) });
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
  await dismissPopups(page);
  const evidence = await saveEvidence(page, 'login-start');
  console.log(JSON.stringify({
    status: 'browser_opened_for_manual_login',
    instruction_ko: '브라우저에서 직접 로그인해 주세요. 로그인 후 이 터미널/작업은 닫아도 됩니다. 세션은 전용 로컬 프로필에 저장됩니다.',
    profileDir: PROFILE_DIR,
    evidence,
  }, null, 2));
  // Keep open for manual login.
  await page.waitForTimeout(10 * 60 * 1000).catch(() => {});
  await ctx.close().catch(() => {});
}

async function plan(args) {
  const date = args.date || '2026-06-15';
  const holes = args.holes || '18';
  const prefer = args.prefer || 'cheapest-latest';
  console.log(JSON.stringify({
    status: 'plan_ready',
    target: '더나인GC',
    date,
    holes,
    prefer,
    algorithm: [
      'Reuse dedicated Playwright Chrome profile',
      'Navigate to booking page without mouse animation',
      'Collect visible DOM/network text for price/time candidates',
      'Filter by holes/date; choose lowest green fee, then latest time',
      'Stop before final/binding reservation button',
      'After explicit user approval only, perform scoped final click manually or with guarded command',
    ],
    safetyBoundary: 'No final reservation/payment/submit button is clicked by dry-run or plan mode.',
  }, null, 2));
}

async function dryRun(args) {
  const { ctx, page } = await launchPersistent({ visible: boolArg(args.visible, true) });
  const nav = await gotoBooking(page);
  const evidence = await saveEvidence(page, 'booking-page');
  const signals = await extractBookingSignals(page);
  console.log(JSON.stringify({
    status: 'dry_run_complete',
    nav,
    requested: { date: args.date || null, holes: args.holes || null, prefer: args.prefer || null },
    evidence,
    signals,
    next: signals.hasLoginText
      ? 'manual_login_needed: run npm run login, login in browser, then rerun dry-run'
      : 'selector_mapping_needed: inspect evidence/html and add exact date/time/price extraction selectors for this site version',
  }, null, 2));
  await ctx.close().catch(() => {});
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] || 'plan';
  if (cmd === 'doctor') return doctor(args);
  if (cmd === 'login') return login(args);
  if (cmd === 'plan') return plan(args);
  if (cmd === 'dry-run') return dryRun(args);
  if (cmd === 'cdp-start') return cdpStart(args);
  if (cmd === 'cdp-doctor') return cdpDoctor(args);
  if (cmd === 'cdp-dry-run') return cdpDryRun(args);
  if (cmd === 'cdp-show') return cdpShow(args);
  throw new Error(`Unknown command: ${cmd}`);
}

main().catch(err => {
  console.error(JSON.stringify({ status: 'error', error: String(err?.stack || err) }, null, 2));
  process.exit(1);
});
