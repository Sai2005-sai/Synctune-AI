/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          DEVICE CONFIGURATION                                ║
 * ║  Device  : Motorola Edge 50 Fusion                          ║
 * ║  Serial  : ZA222RK25H                                       ║
 * ║  App     : SyncTune AI (magic pattern)                      ║
 * ║  Package : com.synctune.app                                  ║
 * ║  Appium  : v3.x  |  UiAutomator2                           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const { remote }   = require('webdriverio');
const { execSync } = require('child_process');

let detectedSerial = 'ZA222RK25H';
let detectedName = 'Motorola Edge 50 Fusion';

try {
  const devicesOutput = execSync('adb devices', { stdio: 'pipe' }).toString();
  const deviceLines = devicesOutput.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('List of devices'));
  if (deviceLines.length > 0) {
    const parts = deviceLines[0].split(/\s+/);
    if (parts[0]) {
      detectedSerial = parts[0];
      if (detectedSerial.startsWith('emulator-')) {
        detectedName = 'Android Emulator';
      }
    }
  }
} catch (e) {
  // fallback
}

const DEVICE = {
  serial:   detectedSerial,
  name:     detectedName,
  package:  'com.synctune.app',
  activity: 'com.synctune.app.MainActivity',
};

const CAPABILITIES = {
  hostname: 'localhost',
  port:     4723,
  path:     '/',
  logLevel: 'error',
  capabilities: {
    platformName:                              'Android',
    'appium:automationName':                   'UiAutomator2',
    'appium:deviceName':                       DEVICE.name,
    'appium:udid':                             DEVICE.serial,
    'appium:appPackage':                       DEVICE.package,
    'appium:appActivity':                      DEVICE.activity,
    'appium:noReset':                          true,
    'appium:fullReset':                        false,
    'appium:newCommandTimeout':                600,
    'appium:autoGrantPermissions':             true,
    'appium:skipUnlock':                       true,
    'appium:chromedriverAutodownload':         true,
    'appium:enforceXPath1':                    true,
    'appium:uiautomator2ServerLaunchTimeout':  60000,
    'appium:adbExecTimeout':                   30000,
  },
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── ADB helpers ──────────────────────────────────────────────────────────────
function adb(cmd) {
  try {
    return execSync(`adb -s ${DEVICE.serial} ${cmd}`, { stdio: 'pipe' }).toString().trim();
  } catch { return ''; }
}

async function setupDevice() {
  console.log(`\n📱 Device  : ${DEVICE.name} (${DEVICE.serial})`);
  console.log(`📦 App     : ${DEVICE.package}`);

  // Wake screen
  console.log('💡 Waking screen...');
  adb('shell input keyevent 224');
  adb('shell wm dismiss-keyguard');
  await sleep(1000);

  // Clear app data (fresh start)
  console.log('🧹 Clearing app data...');
  adb(`shell pm clear ${DEVICE.package}`);

  // Grant permissions
  const perms = [
    'android.permission.READ_MEDIA_VIDEO',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.READ_MEDIA_IMAGES',
    'android.permission.CAMERA',
  ];
  for (const p of perms) adb(`shell pm grant ${DEVICE.package} ${p}`);

  // Port forwarding: phone localhost:5000 → PC localhost:5000
  console.log('🌉 Port forwarding: phone:5000 → PC:5000...');
  try {
    execSync('adb reverse tcp:5000 tcp:5000', { stdio: 'pipe' });
    console.log('✅ Port forwarding active');
  } catch(e) { console.log('⚠️  Port forwarding failed:', e.message.split('\n')[0]); }
}

async function createDriver() {
  await setupDevice();
  console.log('\n🔌 Connecting to Appium server...');
  const driver = await remote(CAPABILITIES);

  console.log('⏳ Waiting 8s for app boot + WebView init...');
  await sleep(8000);

  await switchToWebView(driver);
  return driver;
}

async function switchToWebView(driver) {
  try {
    const contexts = await driver.getContexts();
    console.log('🌐 Contexts:', JSON.stringify(contexts));
    const wv = contexts.find(c => String(c).includes('WEBVIEW'));
    if (wv) {
      await driver.switchContext(wv);
      console.log(`✅ Switched to: ${await driver.getContext()}`);
    } else {
      console.log('⚠️  WebView not ready yet — staying in NATIVE_APP');
    }
  } catch(e) {
    console.log('⚠️  Context switch failed:', e.message.split('\n')[0]);
  }
}

async function ensureWebView(driver) {
  try {
    const ctx = String(await driver.getContext());
    if (!ctx.includes('WEBVIEW')) {
      const contexts = await driver.getContexts();
      const wv = contexts.find(c => String(c).includes('WEBVIEW'));
      if (wv) await driver.switchContext(wv);
    }
  } catch {}
}

module.exports = { createDriver, ensureWebView, switchToWebView, DEVICE, sleep };
