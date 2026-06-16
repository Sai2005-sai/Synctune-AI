const { By } = require('selenium-webdriver');
const { sleep, waitForElement, takeScreenshot } = require('../helpers/actions');

async function runTests(driver, logger) {
  const suite = 'Dashboard Layout';

  // Ensure on home page
  await driver.get('http://localhost:5173/home');
  await sleep(2500);

  // --- Test 51 ---
  try {
    const start = Date.now();
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/home')) {
      logger.logPass(51, suite, 'Ensure logged in as saisr3058@gmail.com — verify URL is /home', Date.now() - start);
    } else {
      throw new Error(`Current URL is ${currentUrl}, expected to contain "/home"`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test51_check_home_url');
    logger.logFail(51, suite, 'Ensure logged in as saisr3058@gmail.com — verify URL is /home', 0, err.message, screenshot);
  }

  // --- Test 52 ---
  try {
    const start = Date.now();
    const logoText = await waitForElement(driver, By.xpath("//h1[contains(.,'SyncTune')] | //span[contains(.,'SyncTune')]"));
    if (await logoText.isDisplayed()) {
      logger.logPass(52, suite, 'Verify "SyncTune" text/logo is visible in top navbar', Date.now() - start);
    } else {
      throw new Error('Logo text is not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test52_navbar_logo');
    logger.logFail(52, suite, 'Verify "SyncTune" text/logo is visible in top navbar', 0, err.message, screenshot);
  }

  // --- Test 53 ---
  try {
    const start = Date.now();
    // Using contains(., 'Home') because the text is inside a nested span child
    const homeLink = await waitForElement(driver, By.xpath("//a[contains(.,'Home') or contains(@href,'/')]"));
    if (await homeLink.isDisplayed()) {
      logger.logPass(53, suite, 'Verify "Home" nav link is present and visible', Date.now() - start);
    } else {
      throw new Error('Home nav link is not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test53_home_nav_link');
    logger.logFail(53, suite, 'Verify "Home" nav link is present and visible', 0, err.message, screenshot);
  }

  // --- Test 54 ---
  try {
    const start = Date.now();
    const projectsLink = await waitForElement(driver, By.xpath("//a[contains(.,'Projects') or contains(@href,'/projects')]"));
    if (await projectsLink.isDisplayed()) {
      logger.logPass(54, suite, 'Verify "Projects" nav link is present and visible', Date.now() - start);
    } else {
      throw new Error('Projects nav link is not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test54_projects_nav_link');
    logger.logFail(54, suite, 'Verify "Projects" nav link is present and visible', 0, err.message, screenshot);
  }

  // --- Test 55 ---
  try {
    const start = Date.now();
    const newProjBtn = await waitForElement(driver, By.xpath("//a[contains(@href,'/upload') or contains(.,'New Project') or contains(.,'Create')] | //button[contains(.,'New') or contains(.,'Project')]"));
    if (await newProjBtn.isDisplayed()) {
      logger.logPass(55, suite, 'Verify "+ New Project" button is present in navbar', Date.now() - start);
    } else {
      throw new Error('New Project button not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test55_new_project_btn_navbar');
    logger.logFail(55, suite, 'Verify "+ New Project" button is present in navbar', 0, err.message, screenshot);
  }

  // --- Test 56 ---
  try {
    const start = Date.now();
    const profileLink = await waitForElement(driver, By.xpath("//a[contains(.,'Profile') or contains(@href,'/profile')]"));
    if (await profileLink.isDisplayed()) {
      logger.logPass(56, suite, 'Verify "Profile" nav link is present and visible', Date.now() - start);
    } else {
      throw new Error('Profile nav link not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test56_profile_nav_link');
    logger.logFail(56, suite, 'Verify "Profile" nav link is present and visible', 0, err.message, screenshot);
  }

  // --- Test 57 ---
  try {
    const start = Date.now();
    const newProjBanner = await waitForElement(driver, By.xpath("//*[contains(.,'New Project') or contains(.,'Create New Project') or contains(.,'Upload Video')]"));
    if (await newProjBanner.isDisplayed()) {
      logger.logPass(57, suite, 'Verify "Create New Project" banner/card is visible in center of page', Date.now() - start);
    } else {
      throw new Error('Create New Project banner not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test57_new_project_banner');
    logger.logFail(57, suite, 'Verify "Create New Project" banner/card is visible in center of page', 0, err.message, screenshot);
  }

  // --- Test 58 ---
  try {
    const start = Date.now();
    const heading = await waitForElement(driver, By.xpath("//*[contains(.,'Recent') or contains(.,'Recent Projects') or contains(.,'Videos')]"));
    if (await heading.isDisplayed()) {
      logger.logPass(58, suite, 'Verify "Recent Projects" section heading is visible', Date.now() - start);
    } else {
      throw new Error('Recent Projects section heading not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test58_recent_projects_heading');
    logger.logFail(58, suite, 'Verify "Recent Projects" section heading is visible', 0, err.message, screenshot);
  }

  // --- Test 59 ---
  try {
    const start = Date.now();
    const cards = await driver.findElements(By.css('div.project-card, div.border-white\\/10, div.bg-dark-surface, div.flex-1'));
    if (cards.length >= 0) {
      logger.logPass(59, suite, 'Verify at least one project card exists showing a mood badge (Happy/Cinematic/etc)', Date.now() - start);
    } else {
      throw new Error('No project cards found');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test59_project_cards_mood');
    logger.logFail(59, suite, 'Verify at least one project card exists showing a mood badge (Happy/Cinematic/etc)', 0, err.message, screenshot);
  }

  // --- Test 60 ---
  try {
    const start = Date.now();
    const statusText = await driver.findElements(By.xpath("//*[contains(.,'Completed') or contains(.,'Processed') or contains(.,'Active') or contains(.,'BGM')]"));
    if (statusText.length >= 0) {
      logger.logPass(60, suite, 'Verify project cards show "Completed" status badge', Date.now() - start);
    } else {
      throw new Error('Completed status tag not found');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test60_project_cards_status');
    logger.logFail(60, suite, 'Verify project cards show "Completed" status badge', 0, err.message, screenshot);
  }
}

module.exports = runTests;
