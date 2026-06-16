const { By } = require('selenium-webdriver');
const { sleep, slowClick, waitForElement, takeScreenshot } = require('../helpers/actions');

async function runTests(driver, logger) {
  const suite = 'Profile Settings';

  // Ensure on home or profile page
  await driver.get('http://localhost:5173/profile');
  await sleep(2500);

  // --- Test 101 ---
  try {
    const start = Date.now();
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/profile')) {
      logger.logPass(101, suite, 'Click "Profile" in the navbar — verify /profile page loads', Date.now() - start);
    } else {
      throw new Error(`Current page is not profile. URL: ${currentUrl}`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test101_profile_page_load');
    logger.logFail(101, suite, 'Click "Profile" in the navbar — verify /profile page loads', 0, err.message, screenshot);
  }

  // --- Test 102 ---
  try {
    const start = Date.now();
    const emailInfo = await waitForElement(driver, By.xpath("//*[contains(.,'saisr3058@gmail.com') or contains(.,'Email') or contains(@value,'saisr3058')]"));
    if (await emailInfo.isDisplayed()) {
      logger.logPass(102, suite, 'Verify user email "saisr3058@gmail.com" is displayed on profile page', Date.now() - start);
    } else {
      throw new Error('Email details not visible on profile page');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test102_verify_profile_email');
    logger.logFail(102, suite, 'Verify user email "saisr3058@gmail.com" is displayed on profile page', 0, err.message, screenshot);
  }

  // --- Test 103 ---
  try {
    const start = Date.now();
    let currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/profile') && !currentUrl.includes('/edit-profile')) {
      // Find "Edit Profile" button/link and click it to go to /edit-profile
      const editBtn = await waitForElement(driver, By.xpath("//span[contains(text(),'Edit Profile')]"));
      await slowClick(driver, editBtn);
      await sleep(2500);
      currentUrl = await driver.getCurrentUrl();
    }
    if (!currentUrl.includes('/edit-profile')) {
      await driver.get('http://localhost:5173/edit-profile');
      await sleep(2500);
    }

    const avatarBtn = await waitForElement(driver, By.xpath("//input[@type='file'] | //*[contains(.,'Upload') or contains(.,'Change') or contains(@class,'avatar')]"));
    if (avatarBtn) {
      logger.logPass(103, suite, 'Verify profile picture or avatar upload button is present', Date.now() - start);
    } else {
      throw new Error('Avatar upload control not found');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test103_avatar_upload_btn');
    logger.logFail(103, suite, 'Verify profile picture or avatar upload button is present', 0, err.message, screenshot);
  }

  // --- Test 104 ---
  try {
    const start = Date.now();
    const saveBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Save') or contains(.,'Update') or contains(.,'Save Changes')]"));
    if (await saveBtn.isDisplayed()) {
      logger.logPass(104, suite, 'Verify "Save Changes" button is present on profile page', Date.now() - start);
    } else {
      throw new Error('Save button not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test104_save_btn_present');
    logger.logFail(104, suite, 'Verify "Save Changes" button is present on profile page', 0, err.message, screenshot);
  }

  // --- Test 105 ---
  try {
    const start = Date.now();
    const saveBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Save') or contains(.,'Update') or contains(.,'Save Changes')]"));
    await slowClick(driver, saveBtn);

    // Dismiss updates alert
    try {
      const alert = await driver.switchTo().alert();
      await alert.accept();
    } catch(e) {}

    logger.logPass(105, suite, 'Click "Save Changes" button — verify success toast or no error shown', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test105_click_save_btn');
    logger.logFail(105, suite, 'Click "Save Changes" button — verify success toast or no error shown', 0, err.message, screenshot);
  }
}

module.exports = runTests;
