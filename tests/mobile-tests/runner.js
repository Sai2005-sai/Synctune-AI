/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║       SyncTune AI — Mobile E2E Test Runner                      ║
 * ║       Device  : Motorola Edge 50 Fusion (ZA222RK25H)            ║
 * ║       App     : SyncTune AI  |  com.synctune.app                ║
 * ║       Tests   : 104 end-to-end test cases                       ║
 * ║       Report  : Excel (.xlsx) in reports/ folder                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  START COMMANDS (3 separate CMD windows):                        ║
 * ║  1. cd "D:\PDD new\backend\node-api"  →  node server.js         ║
 * ║  2. npx appium --allow-insecure=uiautomator2:chromedriver_autodownload  ║
 * ║  3. cd "D:\PDD new\tests\mobile-tests"  →  node runner.js       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

'use strict';

const path  = require('path');
const http  = require('http');
const { createDriver }   = require('./config/device');
const Logger             = require('./helpers/logger');
const { generateReport } = require('./helpers/report');

const SUITES = [
  { file: './suites/suite01_splash_onboarding.js',    name: 'Splash & Onboarding',     tests: '1–18'   },
  { file: './suites/suite02_registration_signin.js',  name: 'Registration & Sign In',   tests: '19–41'  },
  { file: './suites/suite03_dashboard_profile.js',    name: 'Dashboard & Profile',      tests: '42–66'  },
  { file: './suites/suite04_upload.js',               name: 'Upload Video',             tests: '67–86'  },
  { file: './suites/suite05_profile_signout.js',      name: 'Profile & Sign Out',       tests: '87–104' },
  { file: './suites/suite06_extended_features.js',    name: 'Mobile Extended Suite',    tests: '105–215' },
];

const REPORTS_DIR = path.join(__dirname, 'reports');

function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000', () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

async function main() {
  console.clear();
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        SyncTune AI — E2E Mobile Test Suite                  ║');
  console.log('║        Device: Motorola Edge 50 Fusion                      ║');
  console.log('║        215 Tests | Appium + WebdriverIO                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('🔍 Checking backend connection on http://localhost:5000...');
  const isBackendOnline = await checkBackend();
  if (!isBackendOnline) {
    console.log('❌ WARNING: Local backend is not reachable on port 5000.');
    console.log('   Please make sure to run:');
    console.log('   cd "D:\\PDD new\\backend\\node-api" && node server.js\n');
  } else {
    console.log('✅ Backend server is online and reachable.\n');
  }

  const logger = new Logger();
  let driver;

  try {
    driver = await createDriver();
    console.log('\n✅ Device connected & app launched — watch your phone!\n');
    console.log('─'.repeat(62));

    for (const s of SUITES) {
      console.log(`\n📂 ${s.name} (Tests ${s.tests})`);
      try {
         const suite = require(s.file);
         await suite(driver, logger);
      } catch(err) {
        console.error(`\n💥 Suite crashed [${s.name}]:`, err.message.split('\n')[0]);
      }
    }

  } catch(err) {
    console.error('\n❌ Driver initialization failed:', err.message.split('\n')[0]);
    console.error('\n🔧 Troubleshooting checklist:');
    console.error('   ① Backend running?  →  node "D:\\PDD new\\backend\\node-api\\server.js"');
    console.error('   ② Appium running?   →  npx appium --allow-insecure=uiautomator2:chromedriver_autodownload');
    console.error('   ③ Phone connected?  →  adb devices  (should show ZA222RK25H)');
    console.error('   ④ App installed?    →  adb shell pm list packages | findstr synctune');
  } finally {
    if (driver) {
      try { await driver.deleteSession(); console.log('\n🔌 Appium session closed.'); } catch {}
    }

    // Print summary
    logger.summary();

    // Generate Excel report
    try {
      const stats    = logger.getStats();
      const results  = logger.export();
      const outPath  = await generateReport(results, stats, REPORTS_DIR);
      console.log(`📊 Open report: ${outPath}\n`);
    } catch(e) {
      console.error('⚠️  Report generation failed:', e.message);
    }
  }
}

main();
