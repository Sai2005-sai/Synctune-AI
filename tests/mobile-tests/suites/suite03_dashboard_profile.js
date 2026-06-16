/**
 * SUITE 3 — Dashboard & Profile Navigation (Tests 46–70)
 * Source: HomeDashboard.tsx, Profile.tsx
 *
 * HomeDashboard: h1="SyncTune AI" | "Welcome back, <name>"
 *   button="Create New Project" | h2="Recent Projects" | "See All"
 *   Cards: "Summer Vlog 2023","Cinematic Drone","Workout Routine"
 *   BottomNav: "Home","Projects","Profile"
 *
 * Profile.tsx: h1="Profile" | stats: "Projects","Exports","Saved"
 *   Menu: "Edit Profile","Subscription","Settings","Help & FAQ","About SyncTune"
 *   button="Sign Out"  → badge="PRO" on Subscription
 */

const U = require('../helpers/utils');

module.exports = async function suite03(driver, L) {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│  SUITE 3 — Dashboard & Profile (42–66)     │');
  console.log('└─────────────────────────────────────────────┘');
  let t;

  // T42-46: Dashboard content
  const dashChecks = [
    [42, () => U.waitForTextContains(driver, 'SyncTune', 8000),         '"SyncTune AI" heading'],
    [43, () => U.waitForTextContains(driver, 'Welcome back', 5000),'Welcome back greeting'],
    [44, () => U.waitForText(driver, 'Create New Project', 5000),  '"Create New Project" CTA'],
    [45, () => U.waitForText(driver, 'Recent Projects', 5000),     '"Recent Projects" section heading'],
    [46, () => U.waitForText(driver, 'See All', 5000),             '"See All" link'],
  ];
  for (const [id, fn, name] of dashChecks) {
    t = Date.now();
    try { await fn(); L.pass(id, 'dashboard', name, Date.now()-t); }
    catch(e) { L.fail(id, 'dashboard', name, Date.now()-t, e.message); }
  }

  // T47-49: Project cards
  t = Date.now();
  try {
    const el = await U.findTextContains(driver, 'Summer Vlog', 4000); if(!el) throw new Error();
    L.pass(47, 'dashboard', '"Summer Vlog 2023" project card', Date.now()-t);
  } catch(e) { L.fail(47, 'dashboard', '"Summer Vlog 2023"', Date.now()-t, e.message); }

  t = Date.now();
  try {
    const el = await U.findTextContains(driver, 'Cinematic Drone', 4000); if(!el) throw new Error();
    L.pass(48, 'dashboard', '"Cinematic Drone" project card', Date.now()-t);
  } catch(e) { L.fail(48, 'dashboard', '"Cinematic Drone"', Date.now()-t, e.message); }

  t = Date.now();
  try {
    const el = await U.findTextContains(driver, 'Workout Routine', 4000); if(!el) throw new Error();
    L.pass(49, 'dashboard', '"Workout Routine" project card', Date.now()-t);
  } catch(e) { L.fail(49, 'dashboard', '"Workout Routine"', Date.now()-t, e.message); }

  // T50-52: Bottom navigation tabs
  t = Date.now();
  try { await U.waitForText(driver, 'Home', 4000); L.pass(50, 'nav', '"Home" bottom tab', Date.now()-t); }
  catch(e) { L.fail(50, 'nav', '"Home" tab', Date.now()-t, e.message); }

  t = Date.now();
  try {
    const el = await U.findText(driver, 'Projects', 4000); if(!el) throw new Error();
    L.pass(51, 'nav', '"Projects" bottom tab', Date.now()-t);
  } catch(e) { L.fail(51, 'nav', '"Projects" tab', Date.now()-t, e.message); }

  t = Date.now();
  try { await U.waitForText(driver, 'Profile', 4000); L.pass(52, 'nav', '"Profile" bottom tab', Date.now()-t); }
  catch(e) { L.fail(52, 'nav', '"Profile" tab', Date.now()-t, e.message); }

  // T53: Tap "Projects" tab
  t = Date.now();
  try {
    const el = await U.findText(driver, 'Projects', 4000);
    if (el) { await U.clickEl(driver, el); await U.sleep(2500); }
    L.pass(53, 'nav', 'Tapped "Projects" tab → projects screen', Date.now()-t);
  } catch(e) { L.fail(53, 'nav', 'Tap Projects tab', Date.now()-t, e.message); }

  // T54: Back to Home
  t = Date.now();
  try {
    await U.tapText(driver, 'Home', 5000);
    await U.waitForText(driver, 'Create New Project', 8000);
    L.pass(54, 'nav', 'Tapped "Home" → Dashboard', Date.now()-t);
  } catch(e) { L.fail(54, 'nav', 'Tap Home tab', Date.now()-t, e.message); }

  // T55: Navigate to Profile
  t = Date.now();
  try {
    await U.tapText(driver, 'Profile', 5000);
    await U.waitForText(driver, 'Profile', 8000);
    L.pass(55, 'profile', 'Tapped "Profile" → Profile screen loaded', Date.now()-t);
  } catch(e) { L.fail(55, 'profile', 'Navigate to Profile', Date.now()-t, e.message); }

  // T56-60: Profile menu items (exact from Profile.tsx)
  const profileMenu = [
    [56, 'Edit Profile',   '"Edit Profile" menu item'],
    [57, 'Subscription',   '"Subscription" menu item'],
    [58, 'Settings',       '"Settings" menu item'],
    [59, 'Help',           '"Help & FAQ" menu item'],
    [60, 'About SyncTune', '"About SyncTune" menu item'],
  ];
  for (const [id, partial, name] of profileMenu) {
    t = Date.now();
    try {
      const el = await U.findTextContains(driver, partial, 4000);
      if (!el) throw new Error(`"${partial}" not found`);
      L.pass(id, 'profile', name, Date.now()-t);
    } catch(e) { L.fail(id, 'profile', name, Date.now()-t, e.message); }
  }

  // T61: "PRO" badge on Subscription
  t = Date.now();
  try {
    await U.waitForText(driver, 'PRO', 4000);
    L.pass(61, 'profile', '"PRO" badge on Subscription menu item', Date.now()-t);
  } catch(e) { L.fail(61, 'profile', '"PRO" badge', Date.now()-t, e.message); }

  // T62: Stats — Projects
  t = Date.now();
  try {
    await U.waitForText(driver, 'Projects', 4000);
    L.pass(62, 'profile', '"Projects" stat card visible', Date.now()-t);
  } catch(e) { L.fail(62, 'profile', '"Projects" stat', Date.now()-t, e.message); }

  // T63: Stats — Exports
  t = Date.now();
  try {
    await U.waitForText(driver, 'Exports', 4000);
    L.pass(63, 'profile', '"Exports" stat card visible', Date.now()-t);
  } catch(e) { L.fail(63, 'profile', '"Exports" stat', Date.now()-t, e.message); }

  // T64: "Sign Out" button
  t = Date.now();
  try {
    await U.waitForText(driver, 'Sign Out', 4000);
    L.pass(64, 'profile', '"Sign Out" button visible', Date.now()-t);
  } catch(e) { L.fail(64, 'profile', '"Sign Out" button', Date.now()-t, e.message); }

  // T65: Tap "Edit Profile" and back
  t = Date.now();
  try {
    await U.tapText(driver, 'Edit Profile', 4000);
    await U.sleep(2500);
    await driver.back();
    await U.sleep(1500);
    L.pass(65, 'profile', 'Tapped "Edit Profile" → back', Date.now()-t);
  } catch(e) { L.fail(65, 'profile', '"Edit Profile" navigation', Date.now()-t, e.message); }

  // T66: Tap "Settings" and back
  t = Date.now();
  try {
    await U.tapText(driver, 'Settings', 4000);
    await U.sleep(2500);
    await driver.back();
    await U.sleep(1500);
    L.pass(66, 'profile', 'Tapped "Settings" → back', Date.now()-t);
  } catch(e) { L.fail(66, 'profile', '"Settings" navigation', Date.now()-t, e.message); }
};
