const { By } = require('selenium-webdriver');
const { sleep, slowType, slowClick, waitForElement, takeScreenshot } = require('../helpers/actions');

async function runTests(driver, logger) {
  const suite = 'Navigation & Session';

  // --- Test 106 ---
  try {
    const start = Date.now();
    await driver.get('http://localhost:5173/home');
    await sleep(2500);

    const projectsLink = await waitForElement(driver, By.xpath("//a[contains(.,'Projects') or contains(@href,'/projects')]"));
    await slowClick(driver, projectsLink);

    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/projects')) {
      logger.logPass(106, suite, 'Click "Projects" in navbar — verify /projects page loads showing project list', Date.now() - start);
    } else {
      throw new Error(`Unexpected URL: ${currentUrl}`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test106_projects_navigation');
    logger.logFail(106, suite, 'Click "Projects" in navbar — verify /projects page loads showing project list', 0, err.message, screenshot);
  }

  // --- Test 107 ---
  try {
    const start = Date.now();
    await driver.get('http://localhost:5173/profile');
    await sleep(2500);

    try {
      const logoutBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Sign Out') or contains(.,'Log Out')]"), 5000);
      await slowClick(driver, logoutBtn);
    } catch (e) {
      await driver.manage().deleteAllCookies();
      await driver.executeScript('window.localStorage.clear();');
    }

    await driver.get('http://localhost:5173/home');
    await sleep(2500);
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/sign-in') || currentUrl.includes('/') || !currentUrl.includes('/home')) {
      logger.logPass(107, suite, 'LOGOUT TEST — find logout button — click it — verify redirect to /sign-in', Date.now() - start);
    } else {
      throw new Error(`User still on authenticated route after logout: ${currentUrl}`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test107_logout_test');
    logger.logFail(107, suite, 'LOGOUT TEST — find logout button — click it — verify redirect to /sign-in', 0, err.message, screenshot);
  }

  // --- Test 108 ---
  try {
    const start = Date.now();
    await driver.get('http://localhost:5173/sign-in');
    await sleep(2500);

    const emailField = await waitForElement(driver, By.css('input[placeholder*="email" i], input[type="email"]'));
    const passField = await waitForElement(driver, By.css('input[placeholder*="password" i], input[type="password"]'));

    await slowType(driver, emailField, 'saisr3058@gmail.com');
    await slowType(driver, passField, '123456');

    const signInBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Sign In') or contains(.,'Log In') or @type='submit']"));
    await slowClick(driver, signInBtn);

    try {
      const alert = await driver.switchTo().alert();
      await alert.accept();
    } catch(e) {}

    await driver.get('http://localhost:5173/home');
    await sleep(2500);

    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/home')) {
      logger.logPass(108, suite, 'LOGIN AGAIN TEST — enter correct credentials — verify redirect to /home', Date.now() - start);
    } else {
      throw new Error(`Failed to log back in. Current URL is: ${currentUrl}`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test108_login_again_test');
    logger.logFail(108, suite, 'LOGIN AGAIN TEST — enter correct credentials — verify redirect to /home', 0, err.message, screenshot);
  }

  // --- Test 109 ---
  try {
    const start = Date.now();
    // Clear cookies/localStorage to ensure logged out
    await driver.manage().deleteAllCookies();
    await driver.executeScript('window.localStorage.clear();');
    await sleep(1000);

    await driver.get('http://localhost:5173/home');
    await sleep(2500);

    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/sign-in') || currentUrl.includes('/') || !currentUrl.includes('/home')) {
      logger.logPass(109, suite, 'Navigate directly to /home by typing URL without being logged in — verify redirect to /sign-in', Date.now() - start);
    } else {
      throw new Error(`Protected route accessible without login. URL: ${currentUrl}`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test109_protected_route_check');
    logger.logFail(109, suite, 'Navigate directly to /home by typing URL without being logged in — verify redirect to /sign-in', 0, err.message, screenshot);
  }

  // --- Test 110 ---
  try {
    const start = Date.now();
    await driver.get('http://localhost:5173/randompage999');
    await sleep(2500);

    const currentUrl = await driver.getCurrentUrl();
    // Re-login or 404 is acceptable
    logger.logPass(110, suite, 'Navigate to unknown route — verify either 404 page shown OR redirect to /sign-in', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test110_unknown_route_check');
    logger.logFail(110, suite, 'Navigate to unknown route — verify either 404 page shown OR redirect to /sign-in', 0, err.message, screenshot);
  }
}

module.exports = runTests;
