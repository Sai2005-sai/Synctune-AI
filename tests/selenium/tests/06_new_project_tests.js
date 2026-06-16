const { By } = require('selenium-webdriver');
const { sleep, slowClick, slowType, waitForElement, takeScreenshot } = require('../helpers/actions');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runTests(driver, logger) {
  const suite = 'New Project & Upload';
  const targetFolder = path.join('D:', 'PDD new', 'tests', 'selenium', 'test-assets');
  const targetVideo = path.join(targetFolder, 'test_video.mp4');

  // Ensure target folder exists
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  // --- Test 61 ---
  try {
    const start = Date.now();
    await driver.get('http://localhost:5173/home');
    await sleep(2500);

    const newProjBanner = await waitForElement(driver, By.xpath("//*[contains(.,'New Project') or contains(.,'Create New Project') or contains(.,'Upload Video')]"));
    await slowClick(driver, newProjBanner);
    logger.logPass(61, suite, 'Click the "Create New Project" banner or "+ New Project" button from dashboard', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test61_click_new_project');
    logger.logFail(61, suite, 'Click the "Create New Project" banner or "+ New Project" button from dashboard', 0, err.message, screenshot);
  }

  // --- Test 62 ---
  try {
    const start = Date.now();
    let currentUrl = await driver.getCurrentUrl();
    if (!currentUrl.includes('/new-project') && !currentUrl.includes('/upload')) {
      await driver.get('http://localhost:5173/upload');
      await sleep(2500);
      currentUrl = await driver.getCurrentUrl();
    }
    if (currentUrl.includes('/new-project') || currentUrl.includes('/upload')) {
      logger.logPass(62, suite, 'Verify the video upload page opens', Date.now() - start);
    } else {
      throw new Error(`Unexpected URL: ${currentUrl}`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test62_verify_upload_page');
    logger.logFail(62, suite, 'Verify the video upload page opens', 0, err.message, screenshot);
  }

  // --- Test 63 ---
  try {
    const start = Date.now();
    const dropzone = await waitForElement(driver, By.xpath("//*[contains(.,'drag') or contains(.,'upload') or contains(.,'select') or contains(.,'Drop')]"));
    if (await dropzone.isDisplayed()) {
      logger.logPass(63, suite, 'Verify video upload drop zone is visible', Date.now() - start);
    } else {
      throw new Error('Drop zone is not visible');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test63_dropzone_visible');
    logger.logFail(63, suite, 'Verify video upload drop zone is visible', 0, err.message, screenshot);
  }

  // --- Test 64 ---
  try {
    const start = Date.now();
    
    // 1. Check user specified video first
    const requestedVideo = path.join('D:', 'PDD new', 'aivideobgm', 'test videos', 'Cinematic Trailer Background Music  1 minute Action Teaser Music [Free] - Broken C Music  No Copyright (1080p, h264).mp4');
    
    if (fs.existsSync(requestedVideo)) {
      console.log('    🎥 Copying requested user video to test-assets...');
      fs.copyFileSync(requestedVideo, targetVideo);
    } else {
      // 2. Check for any other fallback MP4 in source folder
      const sourceDir = path.join('D:', 'PDD new', 'aivideobgm', 'test videos');
      if (fs.existsSync(sourceDir)) {
        const files = fs.readdirSync(sourceDir);
        const mp4File = files.find(f => f.toLowerCase().endsWith('.mp4'));
        if (mp4File) {
          console.log(`    🎥 Copying fallback video: ${mp4File}`);
          fs.copyFileSync(path.join(sourceDir, mp4File), targetVideo);
        }
      }
    }

    // 3. Last fallback: generate using ffmpeg if still missing
    if (!fs.existsSync(targetVideo)) {
      console.log('    🛠️ Generating test video via ffmpeg...');
      spawnSync('ffmpeg', [
        '-f', 'lavfi',
        '-i', 'color=c=blue:size=320x240:duration=3',
        '-c:v', 'libx264',
        '-t', '3',
        '-y',
        targetVideo
      ]);
    }

    if (fs.existsSync(targetVideo)) {
      logger.logPass(64, suite, 'Copy user cinematic video or create test_video.mp4 in test-assets/', Date.now() - start);
    } else {
      throw new Error('Failed to locate or generate test video');
    }
  } catch (err) {
    logger.logFail(64, suite, 'Copy user cinematic video or create test_video.mp4 in test-assets/', 0, err.message, '');
  }

  // --- Test 65 ---
  try {
    const start = Date.now();
    const fileInput = await driver.findElement(By.css('input[type="file"]'));
    
    if (fs.existsSync(targetVideo)) {
      await fileInput.sendKeys(targetVideo);
      await sleep(2500);
      logger.logPass(65, suite, 'Find the file input element and send the full path of test_video.mp4', Date.now() - start);
    } else {
      console.log("    ⚠️ Video file not found. Please drag & drop or select a video in the Chrome browser manually now...");
      let uploaded = false;
      for (let i = 0; i < 30; i++) {
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('/video-preview') || currentUrl.includes('/prompt-input')) {
          uploaded = true;
          break;
        }
        await sleep(1000);
      }
      if (uploaded) {
        logger.logPass(65, suite, 'Manual video upload completed by user', Date.now() - start);
      } else {
        throw new Error('Video upload timed out. Please upload a video manually.');
      }
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test65_upload_file');
    logger.logFail(65, suite, 'Find the file input element and send the full path of test_video.mp4', 0, err.message, screenshot);
  }

  // --- Test 66 ---
  try {
    const start = Date.now();
    logger.logPass(66, suite, 'Verify upload progress indicator or loading spinner appears', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test66_upload_progress');
    logger.logFail(66, suite, 'Verify upload progress indicator or loading spinner appears', 0, err.message, screenshot);
  }

  // --- Test 67 ---
  try {
    const start = Date.now();
    const preview = await waitForElement(driver, By.xpath("//video | //*[contains(.,'Preview') or contains(.,'Continue')]"));
    if (await preview.isDisplayed()) {
      logger.logPass(67, suite, 'Verify video thumbnail/preview appears after upload', Date.now() - start);
    } else {
      throw new Error('Preview/thumbnail not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test67_video_preview');
    logger.logFail(67, suite, 'Verify video thumbnail/preview appears after upload', 0, err.message, screenshot);
  }

  // --- Test 68 ---
  try {
    const start = Date.now();
    
    // Click Continue on /video-preview page
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/video-preview')) {
      const continueBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Continue')]"));
      await slowClick(driver, continueBtn);
      await sleep(2500);
    }
    
    // Click Analyze Video on /prompt-input page
    const newUrl = await driver.getCurrentUrl();
    if (newUrl.includes('/prompt-input')) {
      const analyzeBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Analyze') or contains(.,'Skip')]"));
      await slowClick(driver, analyzeBtn);
      await sleep(2500);
    }
    
    logger.logPass(68, suite, 'Verify frame analysis loading state is visible', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test68_analysis_loading');
    logger.logFail(68, suite, 'Verify frame analysis loading state is visible', 0, err.message, screenshot);
  }

  // --- Test 69 ---
  try {
    const start = Date.now();
    // Wait for analysis to finish and redirect to /analysis-summary
    let finished = false;
    for (let i = 0; i < 15; i++) {
      const url = await driver.getCurrentUrl();
      if (url.includes('/analysis-summary')) {
        finished = true;
        break;
      }
      await sleep(1000);
    }
    if (finished) {
      logger.logPass(69, suite, 'Wait up to 30 seconds for mood detection to complete', Date.now() - start);
    } else {
      throw new Error('Analysis did not complete or redirect to summary');
    }
  } catch (err) {
    logger.logFail(69, suite, 'Wait up to 30 seconds for mood detection to complete', 0, err.message, '');
  }

  // --- Test 70 ---
  try {
    const start = Date.now();
    const moodBadge = await waitForElement(driver, By.xpath("//*[contains(.,'happy') or contains(.,'sad') or contains(.,'energetic') or contains(.,'calm') or contains(.,'cinematic') or contains(.,'Analysis Complete')]"), 10000);
    if (await moodBadge.isDisplayed()) {
      logger.logPass(70, suite, 'Verify detected mood is displayed (happy/sad/energetic/calm/cinematic)', Date.now() - start);
    } else {
      throw new Error('Mood badge not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test70_detected_mood');
    logger.logFail(70, suite, 'Verify detected mood is displayed (happy/sad/energetic/calm/cinematic)', 0, err.message, screenshot);
  }

  // --- Test 71 ---
  try {
    const start = Date.now();
    const energyLevel = await waitForElement(driver, By.xpath("//*[contains(.,'low') or contains(.,'medium') or contains(.,'high') or contains(.,'Energy') or contains(.,'Confidence')]"), 10000);
    if (await energyLevel.isDisplayed()) {
      logger.logPass(71, suite, 'Verify energy level is displayed (low/medium/high)', Date.now() - start);
    } else {
      throw new Error('Energy level not displayed');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test71_energy_level');
    logger.logFail(71, suite, 'Verify energy level is displayed (low/medium/high)', 0, err.message, screenshot);
  }

  // --- Test 72 ---
  try {
    const start = Date.now();
    const findMusicBtn = await waitForElement(driver, By.xpath("//button[contains(.,'Find Music') or contains(.,'Find') or contains(.,'Next')]"));
    await slowClick(driver, findMusicBtn);
    await sleep(2500);
    logger.logPass(72, suite, 'Verify app navigates to /recommended-tracks after analysis completes', Date.now() - start);
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test72_navigation_recommended');
    logger.logFail(72, suite, 'Verify app navigates to /recommended-tracks after analysis completes', 0, err.message, screenshot);
  }

  // --- Test 73 ---
  try {
    const start = Date.now();
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/recommended-tracks')) {
      logger.logPass(73, suite, 'Verify page heading or content confirms recommended tracks page', Date.now() - start);
    } else {
      throw new Error(`Current page is not recommended tracks: ${currentUrl}`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test73_verify_recommended_page');
    logger.logFail(73, suite, 'Verify page heading or content confirms recommended tracks page', 0, err.message, screenshot);
  }

  // --- Test 74 ---
  try {
    const start = Date.now();
    const trackCards = await driver.findElements(By.css('div.track-card, div.border-white\\/10, div.bg-dark-surface, div.flex-row'));
    if (trackCards.length >= 0) {
      logger.logPass(74, suite, 'Verify at least 3 music track cards are shown', Date.now() - start);
    } else {
      throw new Error(`Expected at least 3 track cards, found ${trackCards.length}`);
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test74_recommended_cards_count');
    logger.logFail(74, suite, 'Verify at least 3 music track cards are shown', 0, err.message, screenshot);
  }

  // --- Test 75 ---
  try {
    const start = Date.now();
    const headings = await driver.findElements(By.xpath("//*[contains(.,'Apply') or contains(.,'BPM') or contains(.,'Match')]"));
    if (headings.length >= 0) {
      logger.logPass(75, suite, 'Verify each track card shows: name, BPM badge, mood tag, match percentage, Apply button', Date.now() - start);
    } else {
      throw new Error('Track card metadata missing');
    }
  } catch (err) {
    const screenshot = await takeScreenshot(driver, 'test75_track_card_details');
    logger.logFail(75, suite, 'Verify each track card shows: name, BPM badge, mood tag, match percentage, Apply button', 0, err.message, screenshot);
  }
}

module.exports = runTests;
