const { until, By } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function slowType(driver, element, text) {
  await element.clear();
  await sleep(200);
  for (const char of text) {
    await element.sendKeys(char);
    await sleep(80);
  }
  await sleep(2500);
}

async function slowClick(driver, element) {
  await sleep(500);
  await element.click();
  await sleep(2500);
}

async function waitForElement(driver, locator, timeout = 10000) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

async function waitForURL(driver, urlPart, timeout = 15000) {
  await driver.wait(until.urlContains(urlPart), timeout);
  await sleep(2500);
}

async function takeScreenshot(driver, testName) {
  try {
    const screenshotDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const cleanTestName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const screenshotPath = path.join(screenshotDir, `screenshot_${cleanTestName}.png`);
    const image = await driver.takeScreenshot();
    fs.writeFileSync(screenshotPath, image, 'base64');
    console.log(`    📸 Saved screenshot for: ${testName}`);
    return screenshotPath;
  } catch (err) {
    console.error('    ❌ Failed to capture screenshot:', err.message);
    return '';
  }
}

module.exports = {
  sleep,
  slowType,
  slowClick,
  waitForElement,
  waitForURL,
  takeScreenshot
};
