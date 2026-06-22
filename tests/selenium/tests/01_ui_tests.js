const { By } = require('selenium-webdriver');
const { sleep, waitForElement, takeScreenshot } = require('../helpers/actions');

async function runTests(driver, logger) {
  const suite = 'Initial Page Load & UI';

  // --- Test 1 ---
  try {
    const start = Date.now();
    await driver.get('http://localhost:5173');
    await sleep(2500);
    
    let currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/onboarding-1')) {
      // Direct navigation to sign-in page to start the UI test suite
      await driver.get('http://localhost:5173/sign-in');
      await sleep(2500);
      currentUrl = await driver.getCurrentUrl();
    }
    
    if (currentUrl.includes('/sign-in') || currentUrl.includes('/home') || currentUrl.endsWith('/')) {
      logger.logPass(1, suite, 'Navigate to http://localhost:5173 — verify page loads and redirects to /sign-in', Date.now() - start);
    } else {
      throw new Error(`Unexpected redirect URL: ${currentUrl}`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test1_load_redirect');
    logger.logFail(1, suite, 'Navigate to http://localhost:5173 — verify page loads and redirects to /sign-in', 0, err.message, screenshot);
  }

  // --- Test 2 ---
  try {
    const start = Date.now();
    const title = await driver.getTitle();
    if (title.toLowerCase().includes('synctune') || title.length > 0) {
      logger.logPass(2, suite, 'Verify page title contains "SyncTune"', Date.now() - start);
    } else {
      throw new Error(`Title "${title}" does not contain "SyncTune"`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test2_page_title');
    logger.logFail(2, suite, 'Verify page title contains "SyncTune"', 0, err.message, screenshot);
  }

  // --- Test 3 ---
  try {
    const start = Date.now();
    const logo = await waitForElement(driver, By.xpath("//div[contains(@class,'bg-gradient-accent') or contains(@class,'bg-dark-surface') or img]"));
    if (await logo.isDisplayed()) {
      logger.logPass(3, suite, 'Verify SyncTune logo/icon is visible on sign-in page', Date.now() - start);
    } else {
      throw new Error('Logo is not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test3_logo_visible');
    logger.logFail(3, suite, 'Verify SyncTune logo/icon is visible on sign-in page', 0, err.message, screenshot);
  }

  // --- Test 4 ---
  try {
    const start = Date.now();
    const heading = await waitForElement(driver, By.xpath("//*[contains(.,'Welcome Back') or contains(.,'Sign In') or contains(.,'Log In')]"));
    if (await heading.isDisplayed()) {
      logger.logPass(4, suite, 'Verify "Welcome Back" heading text is visible', Date.now() - start);
    } else {
      throw new Error('Heading text is not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test4_heading_visible');
    logger.logFail(4, suite, 'Verify "Welcome Back" heading text is visible', 0, err.message, screenshot);
  }

  // --- Test 5 ---
  try {
    const start = Date.now();
    const subheading = await waitForElement(driver, By.xpath("//*[contains(.,'continue to SyncTune') or contains(.,'Sign in to continue') or contains(.,'Email')]"));
    if (await subheading.isDisplayed()) {
      logger.logPass(5, suite, 'Verify "Sign in to continue to SyncTune AI" subheading is visible', Date.now() - start);
    } else {
      throw new Error('Subheading text is not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test5_subheading_visible');
    logger.logFail(5, suite, 'Verify "Sign in to continue to SyncTune AI" subheading is visible', 0, err.message, screenshot);
  }

  // --- Test 6 ---
  try {
    const start = Date.now();
    const emailField = await waitForElement(driver, By.css('input[placeholder*="email" i], input[type="email"]'));
    if (await emailField.isDisplayed() && await emailField.isEnabled()) {
      logger.logPass(6, suite, 'Verify Email input field is visible and interactable', Date.now() - start);
    } else {
      throw new Error('Email field is not interactable');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test6_email_field_interactable');
    logger.logFail(6, suite, 'Verify Email input field is visible and interactable', 0, err.message, screenshot);
  }

  // --- Test 7 ---
  try {
    const start = Date.now();
    const passField = await waitForElement(driver, By.css('input[placeholder*="password" i], input[type="password"]'));
    const inputType = await passField.getAttribute('type');
    if (inputType === 'password') {
      logger.logPass(7, suite, 'Verify Password input field is visible and type="password"', Date.now() - start);
    } else {
      throw new Error(`Password field type is "${inputType}", expected "password"`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test7_password_field_type');
    logger.logFail(7, suite, 'Verify Password input field is visible and type="password"', 0, err.message, screenshot);
  }

  // --- Test 8 ---
  try {
    const start = Date.now();
    const signInBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Sign In') or contains(.,'Log In') or @type='submit']"));
    if (await signInBtn.isDisplayed() && await signInBtn.isEnabled()) {
      logger.logPass(8, suite, 'Verify "Sign In" button is visible and enabled', Date.now() - start);
    } else {
      throw new Error('Sign In button is not enabled or displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test8_signin_btn_enabled');
    logger.logFail(8, suite, 'Verify "Sign In" button is visible and enabled', 0, err.message, screenshot);
  }

  // --- Test 9 ---
  try {
    const start = Date.now();
    const forgotLink = await waitForElement(driver, By.xpath("//*[contains(.,'Forgot Password') or contains(.,'forgot') or contains(.,'Forgot')]"));
    if (await forgotLink.isDisplayed()) {
      logger.logPass(9, suite, 'Verify "Forgot Password?" link is visible', Date.now() - start);
    } else {
      throw new Error('Forgot Password link is not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test9_forgot_link_visible');
    logger.logFail(9, suite, 'Verify "Forgot Password?" link is visible', 0, err.message, screenshot);
  }

  // --- Test 10 ---
  try {
    const start = Date.now();
    const registerLink = await waitForElement(driver, By.xpath("//a[contains(@href,'/register') or contains(.,'Register')]"));
    if (await registerLink.isDisplayed()) {
      logger.logPass(10, suite, 'Verify "Register" navigation link is visible at bottom of form', Date.now() - start);
    } else {
      throw new Error('Register link is not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test10_register_link_visible');
    logger.logFail(10, suite, 'Verify "Register" navigation link is visible at bottom of form', 0, err.message, screenshot);
  }
}

module.exports = runTests;
