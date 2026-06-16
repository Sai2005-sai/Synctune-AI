/**
 * SUITE 1 — Splash Screen & Onboarding (Tests 1–20)
 * Source: SplashScreen.tsx, Onboarding1.tsx, Onboarding2.tsx
 *
 * SplashScreen  : h1="SyncTune AI" | p="AI-Powered Music for Your Videos" | 2s auto-nav
 * Onboarding1   : h2="AI Music for Your Videos" | buttons: "Next", "Skip"
 * Onboarding2   : h2="How it Works" | p="Three simple steps to professional audio"
 *                 cards: "Analyze","Sync","Export" | button="Get Started"
 */

const U = require('../helpers/utils');

module.exports = async function suite01(driver, L) {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│  SUITE 1 — Splash & Onboarding (1–20)      │');
  console.log('└─────────────────────────────────────────────┘');
  let t;

  // T1: WebView body loaded
  t = Date.now();
  try {
    await U.findEl(driver, 'body', 10000);
    L.pass(1, 'splash', 'App launched — WebView DOM accessible', Date.now()-t);
  } catch(e) { L.fail(1, 'splash', 'App launched', Date.now()-t, e.message); }

  // T2: Wait for auto-transition (2s splash + 1s buffer)
  t = Date.now();
  await U.sleep(3000);
  L.pass(2, 'splash', 'Waited for splash 2s auto-navigate to Onboarding', Date.now()-t);

  // T3: Onboarding 1 — main heading
  t = Date.now();
  try {
    await U.waitForTextContains(driver, 'AI Music for', 8000);
    L.pass(3, 'onboarding', '"AI Music for Your Videos" heading on Onboarding 1', Date.now()-t);
  } catch(e) { L.fail(3, 'onboarding', 'Onboarding 1 heading', Date.now()-t, e.message); }

  // T4: Onboarding 1 — description text
  t = Date.now();
  try {
    await U.waitForTextContains(driver, 'Instantly generate and sync', 5000);
    L.pass(4, 'onboarding', '"Instantly generate and sync" description visible', Date.now()-t);
  } catch(e) { L.fail(4, 'onboarding', 'Onboarding 1 description', Date.now()-t, e.message); }

  // T5-6: Navigation buttons
  t = Date.now();
  try {
    await U.waitForText(driver, 'Next', 5000);
    L.pass(5, 'onboarding', '"Next" button visible on Onboarding 1', Date.now()-t);
  } catch(e) { L.fail(5, 'onboarding', '"Next" button', Date.now()-t, e.message); }

  t = Date.now();
  try {
    await U.waitForText(driver, 'Skip', 5000);
    L.pass(6, 'onboarding', '"Skip" button visible on Onboarding 1', Date.now()-t);
  } catch(e) { L.fail(6, 'onboarding', '"Skip" button', Date.now()-t, e.message); }

  // T7: Tap Next → Onboarding 2
  t = Date.now();
  try {
    await U.tapText(driver, 'Next', 5000);
    await U.waitForText(driver, 'How it Works', 8000);
    L.pass(7, 'onboarding', 'Tapped "Next" → Onboarding 2 "How it Works" visible', Date.now()-t);
  } catch(e) { L.fail(7, 'onboarding', '"Next" → Onboarding 2', Date.now()-t, e.message); }

  // T8: Onboarding 2 subtitle
  t = Date.now();
  try {
    await U.waitForText(driver, 'Three simple steps to professional audio', 5000);
    L.pass(8, 'onboarding', '"Three simple steps to professional audio" subtitle', Date.now()-t);
  } catch(e) { L.fail(8, 'onboarding', 'Onboarding 2 subtitle', Date.now()-t, e.message); }

  // T9-11: Feature cards
  for (const [id, label] of [[9,'Analyze'],[10,'Sync'],[11,'Export']]) {
    t = Date.now();
    try {
      await U.waitForText(driver, label, 4000);
      L.pass(id, 'onboarding', `"${label}" feature card visible`, Date.now()-t);
    } catch(e) { L.fail(id, 'onboarding', `"${label}" card`, Date.now()-t, e.message); }
  }

  // T12: "Get Started" button
  t = Date.now();
  try {
    await U.waitForText(driver, 'Get Started', 5000);
    L.pass(12, 'onboarding', '"Get Started" button visible', Date.now()-t);
  } catch(e) { L.fail(12, 'onboarding', '"Get Started" button', Date.now()-t, e.message); }

  // T13: Tap "Get Started" → Sign In
  t = Date.now();
  try {
    await U.tapText(driver, 'Get Started', 5000);
    await U.waitForText(driver, 'Welcome Back', 10000);
    L.pass(13, 'onboarding', 'Tapped "Get Started" → Sign In "Welcome Back"', Date.now()-t);
  } catch(e) { L.fail(13, 'onboarding', '"Get Started" → Sign In', Date.now()-t, e.message); }

  // T14: "Sign in to continue to SyncTune AI" subtitle
  t = Date.now();
  try {
    await U.waitForText(driver, 'Sign in to continue to SyncTune AI', 5000);
    L.pass(14, 'onboarding', '"Sign in to continue to SyncTune AI" subtitle', Date.now()-t);
  } catch(e) { L.fail(14, 'onboarding', 'Sign In subtitle after onboarding', Date.now()-t, e.message); }

  // T15: Email input present
  t = Date.now();
  try {
    const el = await U.findInput(driver, 'Enter your email', 5000);
    if (!el) throw new Error('Not found');
    L.pass(15, 'signin', 'Email input field on Sign In screen', Date.now()-t);
  } catch(e) { L.fail(15, 'signin', 'Email input on Sign In', Date.now()-t, e.message); }

  // T16: Password input present
  t = Date.now();
  try {
    const el = await U.findInput(driver, 'Enter your password', 5000);
    if (!el) throw new Error('Not found');
    L.pass(16, 'signin', 'Password input field on Sign In screen', Date.now()-t);
  } catch(e) { L.fail(16, 'signin', 'Password input on Sign In', Date.now()-t, e.message); }

  // T17: "Forgot Password?" link
  t = Date.now();
  try {
    await U.waitForText(driver, 'Forgot Password?', 5000);
    L.pass(17, 'signin', '"Forgot Password?" link visible', Date.now()-t);
  } catch(e) { L.fail(17, 'signin', '"Forgot Password?" link', Date.now()-t, e.message); }

  // T18: "Register" link
  t = Date.now();
  try {
    await U.waitForText(driver, 'Register', 5000);
    L.pass(18, 'signin', '"Register" link visible on Sign In screen', Date.now()-t);
  } catch(e) { L.fail(18, 'signin', '"Register" link', Date.now()-t, e.message); }
};
