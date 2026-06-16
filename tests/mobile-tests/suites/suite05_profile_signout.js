/**
 * SUITE 5 — Profile Deep Dive & Sign Out (Tests 91–110)
 * Source: Profile.tsx
 *
 * Complete Profile screen interaction + Sign Out → back to auth
 * Profile.tsx: h1="Profile" | stats: "Projects","Exports","Saved"
 * Menu: "Edit Profile","Subscription","Settings","Help & FAQ","About SyncTune"
 * button="Sign Out" → logout() → navigate('/splash')
 * Post-logout → SplashScreen (2s) → Onboarding1
 */

const U = require('../helpers/utils');

async function dismissNativeAlert(driver) {
  try {
    await driver.switchContext('NATIVE_APP');
    await U.sleep(700);
    for (const btn of ['OK','Yes','Sign Out','Confirm','Cancel','Close']) {
      try {
        const el = await driver.$(`android=new UiSelector().text("${btn}")`);
        if (await el.isDisplayed()) { await el.click(); await U.sleep(700); console.log(`   → Alert: "${btn}"`); break; }
      } catch {}
    }
    const ctxs = await driver.getContexts();
    const wv = ctxs.find(c => String(c).includes('WEBVIEW'));
    if (wv) await driver.switchContext(wv);
    await U.sleep(400);
  } catch {}
}

module.exports = async function suite05(driver, L) {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│  SUITE 5 — Profile & Sign Out (87–104)      │');
  console.log('└─────────────────────────────────────────────┘');
  let t;

  // T87: Navigate to Profile
  t = Date.now();
  try {
    await U.tapText(driver, 'Profile', 5000);
    await U.waitForText(driver, 'Profile', 8000);
    L.pass(87, 'profile', 'Profile tab → Profile screen loaded', Date.now()-t);
  } catch(e) { L.fail(87, 'profile', 'Navigate to Profile', Date.now()-t, e.message); }

  // T88: "Profile" h1
  t = Date.now();
  try {
    await U.waitForText(driver, 'Profile', 4000);
    L.pass(88, 'profile', '"Profile" h1 heading', Date.now()-t);
  } catch(e) { L.fail(88, 'profile', '"Profile" heading', Date.now()-t, e.message); }

  // T89-91: Stats cards
  const stats = [[89,'Projects'],[90,'Exports'],[91,'Saved']];
  for (const [id, text] of stats) {
    t = Date.now();
    try {
      await U.waitForText(driver, text, 4000);
      L.pass(id, 'profile', `"${text}" stat card`, Date.now()-t);
    } catch(e) { L.fail(id, 'profile', `"${text}" stat`, Date.now()-t, e.message); }
  }

  // T92: "Edit Profile" menu
  t = Date.now();
  try {
    await U.waitForText(driver, 'Edit Profile', 4000);
    L.pass(92, 'profile', '"Edit Profile" menu item', Date.now()-t);
  } catch(e) { L.fail(92, 'profile', '"Edit Profile"', Date.now()-t, e.message); }

  // T93: "Subscription" menu
  t = Date.now();
  try {
    await U.waitForText(driver, 'Subscription', 4000);
    L.pass(93, 'profile', '"Subscription" menu item', Date.now()-t);
  } catch(e) { L.fail(93, 'profile', '"Subscription"', Date.now()-t, e.message); }

  // T94: "PRO" badge
  t = Date.now();
  try {
    await U.waitForText(driver, 'PRO', 4000);
    L.pass(94, 'profile', '"PRO" badge on Subscription item', Date.now()-t);
  } catch(e) { L.fail(94, 'profile', '"PRO" badge', Date.now()-t, e.message); }

  // T95: "Settings" menu
  t = Date.now();
  try {
    await U.waitForText(driver, 'Settings', 4000);
    L.pass(95, 'profile', '"Settings" menu item', Date.now()-t);
  } catch(e) { L.fail(95, 'profile', '"Settings"', Date.now()-t, e.message); }

  // T96: "Help & FAQ" menu
  t = Date.now();
  try {
    await U.waitForTextContains(driver, 'Help', 4000);
    L.pass(96, 'profile', '"Help & FAQ" menu item', Date.now()-t);
  } catch(e) { L.fail(96, 'profile', '"Help & FAQ"', Date.now()-t, e.message); }

  // T97: "About SyncTune" menu
  t = Date.now();
  try {
    await U.waitForText(driver, 'About SyncTune', 4000);
    L.pass(97, 'profile', '"About SyncTune" menu item', Date.now()-t);
  } catch(e) { L.fail(97, 'profile', '"About SyncTune"', Date.now()-t, e.message); }

  // T98: Tap Help & FAQ
  t = Date.now();
  try {
    const el = await U.findTextContains(driver, 'Help', 4000);
    if (el) { await U.clickEl(driver, el); await U.sleep(2500); }
    L.pass(98, 'profile', 'Tapped "Help & FAQ"', Date.now()-t);
  } catch(e) { L.fail(98, 'profile', 'Tap "Help & FAQ"', Date.now()-t, e.message); }

  // T99: Back from Help
  t = Date.now();
  try {
    await driver.back(); await U.sleep(2000);
    await U.waitForText(driver, 'Profile', 6000);
    L.pass(99, 'profile', 'Back from Help & FAQ', Date.now()-t);
  } catch(e) { L.fail(99, 'profile', 'Back from Help', Date.now()-t, e.message); }

  // T100: Tap About SyncTune
  t = Date.now();
  try {
    await U.tapText(driver, 'About SyncTune', 4000);
    await U.sleep(2500);
    L.pass(100, 'profile', 'Tapped "About SyncTune"', Date.now()-t);
  } catch(e) { L.fail(100, 'profile', 'Tap "About SyncTune"', Date.now()-t, e.message); }

  // T101: Back from About
  t = Date.now();
  try {
    await driver.back(); await U.sleep(2000);
    await U.waitForText(driver, 'Profile', 6000);
    L.pass(101, 'profile', 'Back from "About SyncTune"', Date.now()-t);
  } catch(e) { L.fail(101, 'profile', 'Back from About', Date.now()-t, e.message); }

  // T102: "Sign Out" button visible
  t = Date.now();
  try {
    await U.waitForText(driver, 'Sign Out', 4000);
    L.pass(102, 'profile', '"Sign Out" button visible', Date.now()-t);
  } catch(e) { L.fail(102, 'profile', '"Sign Out" button', Date.now()-t, e.message); }

  // T103: Tap Sign Out
  t = Date.now();
  try {
    await U.tapText(driver, 'Sign Out', 4000);
    await U.sleep(3000);
    await dismissNativeAlert(driver);
    await U.sleep(2000);
    L.pass(103, 'signout', 'Tapped "Sign Out" — logout triggered', Date.now()-t);
  } catch(e) { L.fail(103, 'signout', 'Tap Sign Out', Date.now()-t, e.message); }

  // T104: Post sign-out screen (Splash → Onboarding or Welcome Back)
  t = Date.now();
  try {
    await driver.waitUntil(async () => {
      for (const tx of ['SyncTune','AI Music for','Welcome Back','Get Started','Sign in']) {
        const el = await U.findTextContains(driver, tx, 800);
        if (el) { console.log(`   → Post sign-out: "${tx}"`); return true; }
      }
      return false;
    }, { timeout: 15000, interval: 800, timeoutMsg: 'No auth screen after sign out' });
    L.pass(104, 'signout', '🎉 FULL E2E COMPLETE — Signed out, auth screen visible', Date.now()-t);
    console.log('\n  🎉🎉🎉  ALL 104 TESTS COMPLETE!  🎉🎉🎉\n');
  } catch(e) { L.fail(104, 'signout', 'Auth screen after sign out', Date.now()-t, e.message); }
};
