# Comprehensive E2E Testing Suite

This directory contains the full End-to-End automation testing suite for both the Web application (using Selenium) and the Android application (using Appium).

## Folder Structure

- `/selenium/` - Contains the Web testing framework.
  - `/tests/` - Contains 100+ programmatically generated Mocha tests across UI, Functional, Validation, and Status categories.
  - `selenium-runner.js` - Master runner for Web tests.
  - `selenium-report.js` - Excel reporter for Selenium.
- `/appium/` - Contains the Android testing framework.
  - `/tests/` - Contains 100+ mobile tests.
  - `appium-runner.js` - Master runner for Appium tests.
  - `appium-report.js` - Excel reporter for Appium.

## How to Run

1. **Install dependencies** (if you haven't already):
   ```bash
   cd tests
   npm install
   ```

2. **Run Selenium Web Tests**:
   ```bash
   npm run test:selenium
   ```
   *Note: Ensure your web server (e.g., Vite) is running locally on port 5173, or update the `TEST_BASE_URL` in the tests.*
   *After completion, `tests/selenium/selenium-report.xlsx` will be generated.*

3. **Run Appium Android Tests**:
   ```bash
   npm run test:appium
   ```
   *Note: Ensure you have an Android Emulator running and Appium installed globally (`npm i -g appium`).*
   *After completion, `tests/appium/appium-report.xlsx` will be generated.*

4. **Run Both Suites**:
   ```bash
   npm run test:all
   ```

## Excel Reports
The auto-generated `.xlsx` files contain 4 sheets:
1. **Summary Dashboard** (With color-coded pass rates)
2. **Full Test Results**
3. **Category Breakdown**
4. **Failed Tests Detail**
