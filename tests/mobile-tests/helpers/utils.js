/**
 * Test Utilities — WebView / CSS / XPath element helpers
 * All selectors target the Capacitor WebView DOM
 */

const fs   = require('fs');
const path = require('path');
const { ensureWebView } = require('../config/device');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Find element (CSS or XPath) ──────────────────────────────────────────────
async function findEl(driver, selector, timeout = 6000) {
  try {
    await ensureWebView(driver);
    let visibleEl = null;
    await driver.waitUntil(
      async () => {
        try {
          const els = await driver.$$(selector);
          for (const el of els) {
            if (await el.isDisplayed()) {
              visibleEl = el;
              return true;
            }
          }
          return false;
        } catch { return false; }
      },
      { timeout, interval: 300 }
    );
    return visibleEl;
  } catch { return null; }
}

// ── Find element present in DOM (even if hidden) ─────────────────────────────
async function findElPresent(driver, selector, timeout = 6000) {
  try {
    await ensureWebView(driver);
    let existingEl = null;
    await driver.waitUntil(
      async () => {
        try {
          const els = await driver.$$(selector);
          if (els.length > 0) {
            existingEl = els[0];
            return true;
          }
          return false;
        } catch { return false; }
      },
      { timeout, interval: 300 }
    );
    return existingEl;
  } catch { return null; }
}

// ── Find by exact text ────────────────────────────────────────────────────────
async function findText(driver, text, timeout = 5000) {
  return findEl(driver, `//*[normalize-space(.)="${text}" and not(descendant::*[normalize-space(.)="${text}"])]`, timeout);
}

// ── Find by partial text ──────────────────────────────────────────────────────
async function findTextContains(driver, partial, timeout = 5000) {
  return findEl(driver, `//*[contains(.,"${partial}") and not(descendant::*[contains(.,"${partial}")])]`, timeout);
}

// ── Wait for exact text (throws if not found) ─────────────────────────────────
async function waitForText(driver, text, timeout = 12000) {
  const xpath = `//*[normalize-space(.)="${text}" and not(descendant::*[normalize-space(.)="${text}"])]`;
  const el = await findEl(driver, xpath, timeout);
  if (!el) throw new Error(`Text "${text}" not found within ${timeout}ms`);
  return el;
}

// ── Wait for partial text (throws if not found) ───────────────────────────────
async function waitForTextContains(driver, partial, timeout = 12000) {
  const xpath = `//*[contains(.,"${partial}") and not(descendant::*[contains(.,"${partial}")])]`;
  const el = await findEl(driver, xpath, timeout);
  if (!el) throw new Error(`textContains("${partial}") not found in ${timeout}ms`);
  return el;
}

// ── Click Element (Robust scroll + JS fallback) ──────────────────────────────
async function clickEl(driver, el) {
  try {
    await el.click();
  } catch (err) {
    const isIntercepted = err.message.includes('click intercepted') || 
                          err.message.includes('not clickable') ||
                          err.message.includes('Other element would receive') ||
                          err.message.includes('intercepted');
    if (isIntercepted) {
      console.log(`   [Fallback] Click intercepted, executing JS click...`);
      await driver.execute(e => e.click(), el);
    } else {
      throw err;
    }
  }
}

// ── Tap text ──────────────────────────────────────────────────────────────────
async function tapText(driver, text, timeout = 10000) {
  const el = await waitForText(driver, text, timeout);
  await sleep(400);
  await clickEl(driver, el);
  await sleep(2500);
}

// ── Tap partial text ──────────────────────────────────────────────────────────
async function tapTextContains(driver, partial, timeout = 10000) {
  const el = await waitForTextContains(driver, partial, timeout);
  await sleep(400);
  await clickEl(driver, el);
  await sleep(2500);
}

// ── Slow type (char by char — visible & reliable) ────────────────────────────
async function slowType(driver, el, text) {
  try {
    if (typeof el.clearValue === 'function') {
      await el.clearValue();
    } else if (typeof el.setValue === 'function') {
      await el.setValue('');
    } else {
      await driver.execute(e => { e.value = ''; }, el);
    }
  } catch {
    try {
      await driver.execute(e => { e.value = ''; }, el);
    } catch {}
  }
  await sleep(300);
  for (const ch of text) {
    await el.addValue(ch);
    await sleep(80);
  }
  await sleep(800);
}

// ── Find input by placeholder ─────────────────────────────────────────────────
async function findInput(driver, placeholder, timeout = 6000) {
  return findEl(driver, `input[placeholder="${placeholder}"]`, timeout);
}

// ── Dismiss native alert/dialog ───────────────────────────────────────────────
async function dismissNativeAlert(driver) {
  try {
    await driver.switchContext('NATIVE_APP');
    await sleep(800);
    for (const btn of ['OK', 'Yes', 'Allow', 'Dismiss', 'Cancel', 'Close', 'Sign Out']) {
      try {
        const el = await driver.$(`android=new UiSelector().text("${btn}")`);
        if (await el.isDisplayed()) {
          await el.click();
          await sleep(700);
          console.log(`   → Native alert dismissed: "${btn}"`);
          break;
        }
      } catch {}
    }
    const contexts = await driver.getContexts();
    const wv = contexts.find(c => String(c).includes('WEBVIEW'));
    if (wv) await driver.switchContext(wv);
    await sleep(400);
  } catch {}
}

// ── Screenshot ────────────────────────────────────────────────────────────────
async function screenshot(driver, name) {
  try {
    const dir = path.join(__dirname, '..', 'reports', 'screenshots');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const data = await driver.takeScreenshot();
    const file = path.join(dir, `${name}_${Date.now()}.png`);
    fs.writeFileSync(file, data, 'base64');
    return file;
  } catch { return ''; }
}

module.exports = {
  sleep,
  findEl, findElPresent, findText, findTextContains,
  waitForText, waitForTextContains,
  clickEl, tapText, tapTextContains,
  slowType, findInput,
  dismissNativeAlert, screenshot,
};
