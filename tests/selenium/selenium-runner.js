const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { createDriver } = require('./helpers/driver');
const logger = require('./helpers/testLogger');
const { generateReport } = require('./selenium-report');

// Import test files
const runUiTests = require('./tests/01_ui_tests');
const runRegTests = require('./tests/02_registration_tests');
const runLoginValTests = require('./tests/03_login_validation_tests');
const runForgotPassTests = require('./tests/04_forgot_password_tests');
const runDashTests = require('./tests/05_dashboard_tests');
const runNewProjTests = require('./tests/06_new_project_tests');
const runRecTracksTests = require('./tests/07_recommended_tracks_tests');
const runExportTests = require('./tests/08_export_tests');
const runProfileTests = require('./tests/09_profile_tests');
const runNavTests = require('./tests/10_navigation_tests');
const runExtendedTests = require('./tests/11_extended_validation_tests');

async function runMasterTestSuite() {
  console.log('\n=================================================');
  console.log('🚀 SyncTune AI — Selenium E2E Test Suite');
  console.log('📋 Running all E2E test suites...');
  console.log('🌐 Testing: http://localhost:5173');
  console.log('⏳ Chrome will open automatically — watch every step...');
  console.log('=================================================\n');

  // Setup folders
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const testAssetsDir = path.join(__dirname, 'test-assets');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  if (!fs.existsSync(testAssetsDir)) {
    fs.mkdirSync(testAssetsDir, { recursive: true });
  }

  // Generate test video
  const videoPath = path.join(testAssetsDir, 'test_video.mp4');
  if (!fs.existsSync(videoPath)) {
    console.log('⚙️ Programmatically generating test_video.mp4 using ffmpeg...');
    const genVideo = spawnSync('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'color=c=blue:size=320x240:duration=3',
      '-c:v', 'libx264',
      '-t', '3',
      '-y',
      videoPath
    ]);
    if (fs.existsSync(videoPath)) {
      console.log('✅ test_video.mp4 generated successfully.\n');
    } else {
      console.log('⚠️ Warning: ffmpeg failed to execute. Video upload test may require manual video seed or direct navigate fallbacks.\n');
    }
  }

  let driver;
  try {
    driver = await createDriver();
  } catch (err) {
    console.error('❌ Failed to launch Chrome WebDriver. Ensure chromedriver is installed and active.', err.message);
    process.exit(1);
  }

  try {
    // Run all test files sequentially
    console.log('🎬 Running Suite 01: UI/UX Tests...');
    await runUiTests(driver, logger);

    console.log('\n🎬 Running Suite 02: Registration Tests...');
    await runRegTests(driver, logger);

    console.log('\n🎬 Running Suite 03: Login Validation Tests...');
    await runLoginValTests(driver, logger);

    console.log('\n🎬 Running Suite 04: Forgot Password Tests...');
    await runForgotPassTests(driver, logger);

    console.log('\n🎬 Running Suite 05: Dashboard Tests...');
    await runDashTests(driver, logger);

    console.log('\n🎬 Running Suite 06: New Project Tests...');
    await runNewProjTests(driver, logger);

    console.log('\n🎬 Running Suite 07: Recommended Tracks Tests...');
    await runRecTracksTests(driver, logger);

    console.log('\n🎬 Running Suite 08: Export Tests...');
    await runExportTests(driver, logger);

    console.log('\n🎬 Running Suite 09: Profile Tests...');
    await runProfileTests(driver, logger);

    console.log('\n🎬 Running Suite 10: Navigation Tests...');
    await runNavTests(driver, logger);

    console.log('\n🎬 Running Suite 11: Extended Validation Tests...');
    await runExtendedTests(driver, logger);

  } catch (err) {
    console.error('❌ Critical runtime error in E2E master suite:', err.message);
  } finally {
    // Generate Excel report
    const results = logger.exportResults();
    const totalCount = results.length;
    const passed = results.filter(r => r.status === 'PASSED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    const skipped = results.filter(r => r.status === 'SKIPPED').length;
    const passRate = totalCount > 0 ? Math.round((passed / totalCount) * 100) : 0;

    try {
      await generateReport(results);
    } catch (reportErr) {
      console.error('❌ Failed to generate Excel report file:', reportErr.message);
    }

    console.log('\n=================================================');
    console.log('🏁 MASTER SUITE COMPLETE SUMMARY');
    console.log(`✅ Passed:   ${passed} / ${totalCount}`);
    console.log(`❌ Failed:   ${failed} / ${totalCount}`);
    console.log(`⏭️  Skipped:  ${skipped} / ${totalCount}`);
    console.log(`📊 Pass Rate: ${passRate}%`);
    console.log('📁 Report: D:/PDD new/tests/selenium/selenium-report.xlsx');
    console.log('=================================================\n');

    if (driver) {
      try {
        await driver.quit();
      } catch (e) {}
    }

    if (failed > 0) {
      console.error(`❌ E2E suite failed with ${failed} test failures.`);
      process.exit(1);
    }
  }
}

runMasterTestSuite();
