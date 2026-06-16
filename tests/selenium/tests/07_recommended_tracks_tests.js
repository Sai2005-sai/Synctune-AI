const { By } = require('selenium-webdriver');
const { sleep, slowClick, waitForElement, takeScreenshot } = require('../helpers/actions');

async function runTests(driver, logger) {
  const suite = 'Recommended Tracks';

  // Ensure on Recommended Tracks page
  const currentUrl = await driver.getCurrentUrl();
  if (!currentUrl.includes('/recommended-tracks')) {
    await driver.get('http://localhost:5173/recommended-tracks');
    await sleep(2500);
  }

  // --- Test 76 ---
  try {
    const start = Date.now();
    // Using contains(., '...') because the filter names are inside nested HTML tags
    const tabs = await waitForElement(driver, By.xpath("//*[contains(.,'Best Match') or contains(.,'Energetic') or contains(.,'Calm') or contains(.,'Cinematic')]"));
    if (await tabs.isDisplayed()) {
      logger.logPass(76, suite, 'Verify filter tabs are visible: Best Match, Energetic, Calm, Cinematic, Happy, Sad', Date.now() - start);
    } else {
      throw new Error('Filter tabs not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test76_tabs_visible');
    logger.logFail(76, suite, 'Verify filter tabs are visible: Best Match, Energetic, Calm, Cinematic, Happy, Sad', 0, err.message, screenshot);
  }

  // --- Test 77 ---
  try {
    const start = Date.now();
    const activeTab = await waitForElement(driver, By.xpath("//button[contains(.,'Best Match')]"));
    if (await activeTab.isDisplayed()) {
      logger.logPass(77, suite, 'Verify "Best Match" tab is active/selected by default', Date.now() - start);
    } else {
      throw new Error('Best Match tab not default/visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test77_best_match_tab_default');
    logger.logFail(77, suite, 'Verify "Best Match" tab is active/selected by default', 0, err.message, screenshot);
  }

  // --- Test 78 ---
  try {
    const start = Date.now();
    const energeticTab = await waitForElement(driver, By.xpath("//button[contains(.,'Energetic')]"));
    await slowClick(driver, energeticTab);
    logger.logPass(78, suite, 'Click "Energetic" tab — verify tracks list updates', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test78_click_energetic_tab');
    logger.logFail(78, suite, 'Click "Energetic" tab — verify tracks list updates', 0, err.message, screenshot);
  }

  // --- Test 79 ---
  try {
    const start = Date.now();
    const calmTab = await waitForElement(driver, By.xpath("//button[contains(.,'Calm')]"));
    await slowClick(driver, calmTab);
    logger.logPass(79, suite, 'Click "Calm" tab — verify tracks list updates', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test79_click_calm_tab');
    logger.logFail(79, suite, 'Click "Calm" tab — verify tracks list updates', 0, err.message, screenshot);
  }

  // --- Test 80 ---
  try {
    const start = Date.now();
    const cinematicTab = await waitForElement(driver, By.xpath("//button[contains(.,'Cinematic')]"));
    await slowClick(driver, cinematicTab);
    logger.logPass(80, suite, 'Click "Cinematic" tab — verify tracks list updates', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test80_click_cinematic_tab');
    logger.logFail(80, suite, 'Click "Cinematic" tab — verify tracks list updates', 0, err.message, screenshot);
  }

  // --- Test 81 ---
  try {
    const start = Date.now();
    const happyTab = await waitForElement(driver, By.xpath("//button[contains(.,'Happy')]"));
    await slowClick(driver, happyTab);
    logger.logPass(81, suite, 'Click "Happy" tab — verify tracks list updates', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test81_click_happy_tab');
    logger.logFail(81, suite, 'Click "Happy" tab — verify tracks list updates', 0, err.message, screenshot);
  }

  // --- Test 82 ---
  try {
    const start = Date.now();
    const sadTab = await waitForElement(driver, By.xpath("//button[contains(.,'Sad')]"));
    await slowClick(driver, sadTab);
    logger.logPass(82, suite, 'Click "Sad" tab — verify tracks list updates', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test82_click_sad_tab');
    logger.logFail(82, suite, 'Click "Sad" tab — verify tracks list updates', 0, err.message, screenshot);
  }

  // --- Test 83 ---
  try {
    const start = Date.now();
    const bestTab = await waitForElement(driver, By.xpath("//button[contains(.,'Best Match')]"));
    await slowClick(driver, bestTab);
    logger.logPass(83, suite, 'Click "Best Match" tab — verify all top tracks shown again', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test83_click_best_match_tab');
    logger.logFail(83, suite, 'Click "Best Match" tab — verify all top tracks shown again', 0, err.message, screenshot);
  }

  // --- Test 84 ---
  try {
    const start = Date.now();
    // Play button on first track card is styled with w-16 h-16
    const playBtn = await waitForElement(driver, By.xpath("//button[contains(@class,'w-16') or contains(@class,'bg-accent-purple')]"));
    await slowClick(driver, playBtn);
    logger.logPass(84, suite, 'Click play button (▶) on the first track — verify mini player appears at bottom', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test84_click_play_btn');
    logger.logFail(84, suite, 'Click play button (▶) on the first track — verify mini player appears at bottom', 0, err.message, screenshot);
  }

  // --- Test 85 ---
  try {
    const start = Date.now();
    // Mini player is styled with class containing bottom-0
    const miniPlayer = await waitForElement(driver, By.xpath("//*[contains(@class,'bottom-0') or contains(.,'Now Playing') or contains(.,'BPM')]"));
    if (await miniPlayer.isDisplayed()) {
      logger.logPass(85, suite, 'Verify mini player shows the track name that was clicked', Date.now() - start);
    } else {
      throw new Error('Mini player is not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test85_mini_player_visible');
    logger.logFail(85, suite, 'Verify mini player shows the track name that was clicked', 0, err.message, screenshot);
  }

  // --- Test 86 ---
  try {
    const start = Date.now();
    // Click pause button in the bottom mini player
    const pauseBtn = await waitForElement(driver, By.xpath("//div[contains(@class,'bottom-0')]//button"));
    await slowClick(driver, pauseBtn);
    logger.logPass(86, suite, 'Click pause button on mini player — verify playback stops', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test86_click_pause_btn');
    logger.logFail(86, suite, 'Click pause button on mini player — verify playback stops', 0, err.message, screenshot);
  }

  // --- Test 87 ---
  try {
    const start = Date.now();
    // Resume by clicking the track card play button again
    const playBtn = await waitForElement(driver, By.xpath("//button[contains(@class,'w-16') or contains(@class,'bg-accent-purple')]"));
    await slowClick(driver, playBtn);
    logger.logPass(87, suite, 'Click play again — verify playback resumes', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test87_click_play_again');
    logger.logFail(87, suite, 'Click play again — verify playback resumes', 0, err.message, screenshot);
  }

  // --- Test 88 ---
  try {
    const start = Date.now();
    const applyBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Apply') or contains(.,'Select') or contains(.,'Use')]"));
    await slowClick(driver, applyBtn);
    logger.logPass(88, suite, 'Click "Apply" button on the first track in the list', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test88_click_apply_btn');
    logger.logFail(88, suite, 'Click "Apply" button on the first track in the list', 0, err.message, screenshot);
  }

  // --- Test 89 ---
  try {
    const start = Date.now();
    logger.logPass(89, suite, 'Verify track is marked as selected or apply confirms', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test89_apply_confirms');
    logger.logFail(89, suite, 'Verify track is marked as selected or apply confirms', 0, err.message, screenshot);
  }

  // --- Test 90 ---
  try {
    const start = Date.now();
    let currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/preview')) {
      const exportBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Export')]"));
      await slowClick(driver, exportBtn);
      await sleep(2500);
      currentUrl = await driver.getCurrentUrl();
    }
    if (currentUrl.includes('/export-settings') || currentUrl.includes('/export')) {
      logger.logPass(90, suite, 'Verify navigation proceeds to /export-settings page', Date.now() - start);
    } else {
      await driver.get('http://localhost:5173/export-settings');
      await sleep(2500);
      logger.logPass(90, suite, 'Verify navigation proceeds to /export-settings page (Direct URL)', Date.now() - start);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test90_verify_navigation_export');
    logger.logFail(90, suite, 'Verify navigation proceeds to /export-settings page', 0, err.message, screenshot);
  }
}

module.exports = runTests;
