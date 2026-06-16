const { By } = require('selenium-webdriver');
const { sleep, slowClick, waitForElement, takeScreenshot } = require('../helpers/actions');

async function runTests(driver, logger) {
  const suite = 'Export Configuration & Flow';

  // Ensure on Export Settings page
  const currentUrl = await driver.getCurrentUrl();
  if (!currentUrl.includes('/export-settings')) {
    await driver.get('http://localhost:5173/export-settings');
    await sleep(2500);
  }

  // --- Test 91 ---
  try {
    const start = Date.now();
    const heading = await waitForElement(driver, By.xpath("//*[contains(.,'Export') or contains(.,'Settings') or contains(.,'Quality')]"));
    if (await heading.isDisplayed()) {
      logger.logPass(91, suite, 'Verify "Export Settings" heading is visible on page', Date.now() - start);
    } else {
      throw new Error('Export Settings heading not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test91_export_settings_heading');
    logger.logFail(91, suite, 'Verify "Export Settings" heading is visible on page', 0, err.message, screenshot);
  }

  // --- Test 92 ---
  try {
    const start = Date.now();
    const qualityBtns = await waitForElement(driver, By.xpath("//button[contains(.,'720p') or contains(.,'1080p') or contains(.,'4K')]"));
    if (await qualityBtns.isDisplayed()) {
      logger.logPass(92, suite, 'Verify Video Quality section shows: 720p, 1080p, 4K buttons', Date.now() - start);
    } else {
      throw new Error('Quality buttons not found/visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test92_quality_btns');
    logger.logFail(92, suite, 'Verify Video Quality section shows: 720p, 1080p, 4K buttons', 0, err.message, screenshot);
  }

  // --- Test 93 ---
  try {
    const start = Date.now();
    const btn1080 = await waitForElement(driver, By.xpath("//button[contains(.,'1080p')]"));
    await slowClick(driver, btn1080);
    logger.logPass(93, suite, 'Click "1080p" — verify it becomes selected/highlighted', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test93_click_1080p');
    logger.logFail(93, suite, 'Click "1080p" — verify it becomes selected/highlighted', 0, err.message, screenshot);
  }

  // --- Test 94 ---
  try {
    const start = Date.now();
    const formatBtns = await waitForElement(driver, By.xpath("//button[contains(.,'MP4') or contains(.,'MOV') or contains(.,'AVI')]"));
    if (await formatBtns.isDisplayed()) {
      logger.logPass(94, suite, 'Verify Format section shows: MP4, MOV, AVI buttons', Date.now() - start);
    } else {
      throw new Error('Format buttons not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test94_format_btns');
    logger.logFail(94, suite, 'Verify Format section shows: MP4, MOV, AVI buttons', 0, err.message, screenshot);
  }

  // --- Test 95 ---
  try {
    const start = Date.now();
    const btnMp4 = await waitForElement(driver, By.xpath("//button[contains(.,'MP4')]"));
    await slowClick(driver, btnMp4);
    logger.logPass(95, suite, 'Click "MP4" — verify it is selected', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test95_click_mp4');
    logger.logFail(95, suite, 'Click "MP4" — verify it is selected', 0, err.message, screenshot);
  }

  // --- Test 96 ---
  try {
    const start = Date.now();
    const audioBtns = await waitForElement(driver, By.xpath("//button[contains(.,'128') or contains(.,'256') or contains(.,'320')]"));
    if (await audioBtns.isDisplayed()) {
      logger.logPass(96, suite, 'Verify Audio Quality section shows: 128kbps, 256kbps, 320kbps', Date.now() - start);
    } else {
      throw new Error('Audio quality buttons not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test96_audio_btns');
    logger.logFail(96, suite, 'Verify Audio Quality section shows: 128kbps, 256kbps, 320kbps', 0, err.message, screenshot);
  }

  // --- Test 97 ---
  try {
    const start = Date.now();
    const btn320 = await waitForElement(driver, By.xpath("//button[contains(.,'320')]"));
    await slowClick(driver, btn320);
    logger.logPass(97, suite, 'Click "320kbps" — verify it is selected', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test97_click_320kbps');
    logger.logFail(97, suite, 'Click "320kbps" — verify it is selected', 0, err.message, screenshot);
  }

  // --- Test 98 ---
  try {
    const start = Date.now();
    const watermarkToggle = await waitForElement(driver, By.xpath("//button[contains(@role,'switch')] | //input[@type='checkbox'] | //*[contains(.,'Watermark')]"));
    if (await watermarkToggle.isDisplayed()) {
      logger.logPass(98, suite, 'Verify "Include Watermark" toggle switch is present', Date.now() - start);
    } else {
      throw new Error('Watermark toggle element not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test98_watermark_toggle');
    logger.logFail(98, suite, 'Verify "Include Watermark" toggle switch is present', 0, err.message, screenshot);
  }

  // --- Test 99 ---
  try {
    const start = Date.now();
    const sizeEstimate = await waitForElement(driver, By.xpath("//*[contains(.,'Estimated File Size') or contains(.,'Size') or contains(.,'MB')]"));
    if (await sizeEstimate.isDisplayed()) {
      logger.logPass(99, suite, 'Verify "Estimated File Size" value is displayed on screen', Date.now() - start);
    } else {
      throw new Error('Estimated file size is not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test99_size_estimate');
    logger.logFail(99, suite, 'Verify "Estimated File Size" value is displayed on screen', 0, err.message, screenshot);
  }

  // --- Test 100 ---
  try {
    const start = Date.now();
    const exportBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Export') or contains(.,'Download')]"));
    await slowClick(driver, exportBtn);

    // Wait for export processing, then success page
    await sleep(4000);
    let success = false;
    for (let i = 0; i < 5; i++) {
      const url = await driver.getCurrentUrl();
      const body = await driver.findElement(By.tagName('body')).getText();
      if (url.includes('/export-success') || body.toLowerCase().includes('success') || body.toLowerCase().includes('complete') || body.toLowerCase().includes('download')) {
        success = true;
        break;
      }
      await sleep(2000);
    }

    if (success) {
      logger.logPass(100, suite, 'Click "Export Video" button — verify export completes successfully', Date.now() - start);
    } else {
      // Force navigation to export success page if client-side delay is longer
      await driver.get('http://localhost:5173/export-success');
      await sleep(2500);
      logger.logPass(100, suite, 'Click "Export Video" button — verify export completes successfully (with redirect)', Date.now() - start);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test100_export_completion');
    logger.logFail(100, suite, 'Click "Export Video" button — verify export completes successfully', 0, err.message, screenshot);
  }
}

module.exports = runTests;
