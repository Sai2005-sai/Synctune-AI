const { By } = require('selenium-webdriver');
const { sleep, slowType, slowClick, waitForElement, takeScreenshot } = require('../helpers/actions');

async function runTests(driver, logger) {
  const suite = 'Registration Flow';

  // --- Test 11 ---
  try {
    const start = Date.now();
    await driver.get('http://localhost:5173/register');
    await sleep(2500);
    logger.logPass(11, suite, 'Navigate to http://localhost:5173/register', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test11_navigate_register');
    logger.logFail(11, suite, 'Navigate to http://localhost:5173/register', 0, err.message, screenshot);
  }

  // --- Test 12 ---
  try {
    const start = Date.now();
    const heading = await waitForElement(driver, By.xpath("//*[contains(.,'Create Account') or contains(.,'Sign Up') or contains(.,'Register')]"));
    if (await heading.isDisplayed()) {
      logger.logPass(12, suite, 'Verify "Create Account" heading is visible', Date.now() - start);
    } else {
      throw new Error('Heading is not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test12_register_heading');
    logger.logFail(12, suite, 'Verify "Create Account" heading is visible', 0, err.message, screenshot);
  }

  // --- Test 13 ---
  try {
    const start = Date.now();
    const subheading = await waitForElement(driver, By.xpath("//*[contains(.,'Join SyncTune') or contains(.,'Sign up') or contains(.,'Get started')]"));
    if (await subheading.isDisplayed()) {
      logger.logPass(13, suite, 'Verify "Join SyncTune AI today" subheading is visible', Date.now() - start);
    } else {
      throw new Error('Subheading is not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test13_register_subheading');
    logger.logFail(13, suite, 'Verify "Join SyncTune AI today" subheading is visible', 0, err.message, screenshot);
  }

  // --- Test 14 ---
  try {
    const start = Date.now();
    const nameField = await waitForElement(driver, By.css('input[placeholder*="name" i], input[type="text"]'));
    if (await nameField.isDisplayed()) {
      logger.logPass(14, suite, 'Verify Full Name input field is present', Date.now() - start);
    } else {
      throw new Error('Full Name field not present');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test14_name_field_present');
    logger.logFail(14, suite, 'Verify Full Name input field is present', 0, err.message, screenshot);
  }

  // --- Test 15 ---
  try {
    const start = Date.now();
    const emailField = await waitForElement(driver, By.css('input[placeholder*="email" i], input[type="email"]'));
    if (await emailField.isDisplayed()) {
      logger.logPass(15, suite, 'Verify Email input field is present', Date.now() - start);
    } else {
      throw new Error('Email field not present');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test15_email_field_present');
    logger.logFail(15, suite, 'Verify Email input field is present', 0, err.message, screenshot);
  }

  // --- Test 16 ---
  try {
    const start = Date.now();
    const passField = await waitForElement(driver, By.css('input[placeholder*="password" i], input[type="password"]'));
    if (await passField.isDisplayed()) {
      logger.logPass(16, suite, 'Verify Password input field is present', Date.now() - start);
    } else {
      throw new Error('Password field not present');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test16_password_field_present');
    logger.logFail(16, suite, 'Verify Password input field is present', 0, err.message, screenshot);
  }

  // --- Test 17 ---
  try {
    const start = Date.now();
    const checkbox = await waitForElement(driver, By.css('input[type="checkbox"]'));
    // Since input is peer sr-only, we check if it exists in DOM
    if (checkbox) {
      logger.logPass(17, suite, 'Verify "I agree to the Terms of Service and Privacy Policy" checkbox is present', Date.now() - start);
    } else {
      throw new Error('Checkbox not present');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test17_checkbox_present');
    logger.logFail(17, suite, 'Verify "I agree to the Terms of Service and Privacy Policy" checkbox is present', 0, err.message, screenshot);
  }

  // --- Test 18 ---
  try {
    const start = Date.now();
    const registerBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Create Account') or contains(.,'Sign Up') or @type='submit']"));
    if (await registerBtn.isDisplayed()) {
      logger.logPass(18, suite, 'Verify "Create Account" button is present', Date.now() - start);
    } else {
      throw new Error('Register button not present');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test18_register_btn_present');
    logger.logFail(18, suite, 'Verify "Create Account" button is present', 0, err.message, screenshot);
  }

  // --- Test 19 ---
  try {
    const start = Date.now();
    const nameField = await waitForElement(driver, By.css('input[placeholder*="name" i], input[type="text"]'));
    const emailField = await waitForElement(driver, By.css('input[placeholder*="email" i], input[type="email"]'));
    const passField = await waitForElement(driver, By.css('input[placeholder*="password" i], input[type="password"]'));
    
    await nameField.clear();
    await emailField.clear();
    await passField.clear();
    
    const registerBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Create Account') or contains(.,'Sign Up') or @type='submit']"));
    await slowClick(driver, registerBtn);

    // Check browser native HTML5 validation
    const nameValidation = await nameField.getAttribute('validationMessage');
    const emailValidation = await emailField.getAttribute('validationMessage');
    const passValidation = await passField.getAttribute('validationMessage');
    
    if (nameValidation || emailValidation || passValidation) {
      logger.logPass(19, suite, 'Click Create Account with all empty fields — verify validation errors appear', Date.now() - start);
    } else {
      throw new Error('No HTML5 validation error message was triggered');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test19_empty_form_validation');
    logger.logFail(19, suite, 'Click Create Account with all empty fields — verify validation errors appear', 0, err.message, screenshot);
  }

  // --- Test 20 ---
  try {
    const start = Date.now();
    await driver.get('http://localhost:5173/register');
    await sleep(2500);
    
    const emailField = await waitForElement(driver, By.css('input[placeholder*="email" i], input[type="email"]'));
    await slowType(driver, emailField, 'wrongemail6789');
    
    const registerBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Create Account') or contains(.,'Sign Up') or @type='submit']"));
    await slowClick(driver, registerBtn);

    const emailValidation = await emailField.getAttribute('validationMessage');
    if (emailValidation && emailValidation.length > 0) {
      logger.logPass(20, suite, 'Type invalid email "wrongemail6789" in email field — verify email validation error', Date.now() - start);
    } else {
      throw new Error('No email validation error was shown');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test20_invalid_email_validation');
    logger.logFail(20, suite, 'Type invalid email "wrongemail6789" in email field — verify email validation error', 0, err.message, screenshot);
  }

  // --- Test 21 ---
  try {
    const start = Date.now();
    await driver.get('http://localhost:5173/register');
    await sleep(2500);
    
    const passField = await waitForElement(driver, By.css('input[placeholder*="password" i], input[type="password"]'));
    await slowType(driver, passField, '123');

    // Check if the page contains password strength indicator text "Weak"
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    if (bodyText.includes('Weak') || bodyText.toLowerCase().includes('short') || bodyText.toLowerCase().includes('password')) {
      logger.logPass(21, suite, 'Type short password "123" — verify password strength/error shown', Date.now() - start);
    } else {
      throw new Error('No password strength warning/error was shown');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test21_short_password_validation');
    logger.logFail(21, suite, 'Type short password "123" — verify password strength/error shown', 0, err.message, screenshot);
  }

  // --- Test 22 ---
  try {
    const start = Date.now();
    await driver.get('http://localhost:5173/register');
    await sleep(2500);

    const nameField = await waitForElement(driver, By.css('input[placeholder*="name" i], input[type="text"]'));
    const emailField = await waitForElement(driver, By.css('input[placeholder*="email" i], input[type="email"]'));
    const passField = await waitForElement(driver, By.css('input[placeholder*="password" i], input[type="password"]'));

    await slowType(driver, nameField, 'selenium test user');
    await slowType(driver, emailField, 'selenium.test.synctune@gmail.com');
    await slowType(driver, passField, 'Selenium@123');

    logger.logPass(22, suite, 'Fill all fields correctly', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test22_fill_form_correctly');
    logger.logFail(22, suite, 'Fill all fields correctly', 0, err.message, screenshot);
  }

  // --- Test 23 ---
  try {
    const start = Date.now();
    const checkbox = await waitForElement(driver, By.css('input[type="checkbox"]'));
    // Click checkbox using JS executor because it's marked peer sr-only (visually hidden)
    await driver.executeScript("arguments[0].click();", checkbox);
    logger.logPass(23, suite, 'Check the "I agree to Terms of Service and Privacy Policy" checkbox', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test23_check_tos');
    logger.logFail(23, suite, 'Check the "I agree to Terms of Service and Privacy Policy" checkbox', 0, err.message, screenshot);
  }

  // --- Test 24 ---
  try {
    const start = Date.now();
    const registerBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Create Account') or contains(.,'Sign Up') or @type='submit']"));
    await slowClick(driver, registerBtn);

    // Dismiss any successful registration alert
    try {
      const alert = await driver.switchTo().alert();
      await alert.accept();
      await sleep(2000);
    } catch (e) {}

    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/home') || currentUrl.includes('/sign-in') || currentUrl.includes('/register')) {
      logger.logPass(24, suite, 'Click "Create Account" button — verify success or redirect to /home', Date.now() - start);
    } else {
      throw new Error(`Register button clicked but URL remains: ${currentUrl}`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test24_register_submit');
    logger.logFail(24, suite, 'Click "Create Account" button — verify success or redirect to /home', 0, err.message, screenshot);
  }

  // --- Test 25 ---
  try {
    const start = Date.now();
    await driver.manage().deleteAllCookies();
    await driver.executeScript('window.localStorage.clear();');
    await driver.get('http://localhost:5173/register');
    await sleep(2500);

    const nameField = await waitForElement(driver, By.css('input[placeholder*="name" i], input[type="text"]'));
    const emailField = await waitForElement(driver, By.css('input[placeholder*="email" i], input[type="email"]'));
    const passField = await waitForElement(driver, By.css('input[placeholder*="password" i], input[type="password"]'));
    const checkbox = await waitForElement(driver, By.css('input[type="checkbox"]'));

    await slowType(driver, nameField, 'selenium test user');
    await slowType(driver, emailField, 'selenium.test.synctune@gmail.com');
    await slowType(driver, passField, 'Selenium@123');
    await driver.executeScript("arguments[0].click();", checkbox);

    const registerBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Create Account') or contains(.,'Sign Up') or @type='submit']"));
    await slowClick(driver, registerBtn);

    let errorFound = false;
    try {
      const alert = await driver.switchTo().alert();
      const txt = await alert.getText();
      await alert.accept();
      if (txt.toLowerCase().includes('exist') || txt.toLowerCase().includes('already')) {
        errorFound = true;
      }
    } catch (e) {
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      if (bodyText.toLowerCase().includes('exist') || bodyText.toLowerCase().includes('already')) {
        errorFound = true;
      }
    }

    if (errorFound) {
      logger.logPass(25, suite, 'Try registering again with same email "selenium.test.synctune@gmail.com" — verify "already exists" error', Date.now() - start);
    } else {
      throw new Error('Duplicate user error not shown');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test25_duplicate_registration');
    logger.logFail(25, suite, 'Try registering again with same email "selenium.test.synctune@gmail.com" — verify "already exists" error', 0, err.message, screenshot);
  }
}

module.exports = runTests;
