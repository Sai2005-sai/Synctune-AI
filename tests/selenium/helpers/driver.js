const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments(
    '--window-size=1920,1080',
    '--disable-notifications',
    '--disable-infobars',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--start-maximized'
  );

  if (process.env.CI) {
    options.addArguments('--headless=new');
  }

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  return driver;
}

module.exports = { createDriver };
