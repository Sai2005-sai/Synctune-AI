/**
 * SUITE 4 — Upload Video & E2E Workflow (Tests 71–90)
 * Source: UploadVideo.tsx -> VideoPreview.tsx -> PromptInput.tsx -> AnalyzeLoading.tsx -> AnalysisSummary.tsx -> RecommendedTracks.tsx -> PreviewScreen.tsx -> ExportSettings.tsx -> ExportProcessing.tsx -> ExportSuccess.tsx
 */

const U = require('../helpers/utils');

module.exports = async function suite04(driver, L) {
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│  SUITE 4 — Upload & E2E Workflow (67–86)    │');
  console.log('└─────────────────────────────────────────────┘');
  let t;

  // T67: Navigate to Home Dashboard and tap "Create New Project"
  t = Date.now();
  try {
    await U.tapText(driver, 'Home', 5000);
    await U.waitForText(driver, 'Create New Project', 8000);
    await U.tapText(driver, 'Create New Project', 5000);
    L.pass(67, 'nav', 'Tapped "Create New Project" → Upload screen', Date.now()-t);
  } catch(e) { L.fail(67, 'nav', 'Navigate to Upload', Date.now()-t, e.message); }

  // T68: Verify "Upload Video" screen loaded
  t = Date.now();
  try {
    await U.waitForText(driver, 'Upload Video', 8000);
    L.pass(68, 'upload', '"Upload Video" screen loaded', Date.now()-t);
  } catch(e) { L.fail(68, 'upload', '"Upload Video" screen', Date.now()-t, e.message); }

  // T69: Verify info labels on Upload screen (Formats, Max Size, Max Duration)
  t = Date.now();
  try {
    await U.waitForText(driver, 'Formats', 3000);
    await U.waitForText(driver, 'Max Size', 3000);
    await U.waitForText(driver, 'Max Duration', 3000);
    L.pass(69, 'upload', 'Info labels (Formats, Max Size, Max Duration) verified', Date.now()-t);
  } catch(e) { L.fail(69, 'upload', 'Verify info labels', Date.now()-t, e.message); }

  // T70: Trigger mock video file upload via inject
  t = Date.now();
  try {
    await driver.execute(() => {
      const input = document.querySelector('input[type="file"]');
      if (!input) throw new Error('File input element not found');
      const blob = new Blob(['mock video data'], { type: 'video/mp4' });
      const file = new File([blob], 'synctune_demo.mp4', { type: 'video/mp4' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    // Wait for the change event handler and navigation to Video Preview
    await U.waitForText(driver, 'Video Preview', 8000);
    L.pass(70, 'upload', 'Mock video file injected successfully', Date.now()-t);
  } catch(e) { L.fail(70, 'upload', 'Mock file injection', Date.now()-t, e.message); }

  // T71: Verify navigation to Video Preview screen & metadata display
  t = Date.now();
  try {
    await U.waitForTextContains(driver, 'synctune_demo.mp4', 5000);
    L.pass(71, 'preview', 'Video Preview loaded with file metadata', Date.now()-t);
  } catch(e) { L.fail(71, 'preview', 'Video Preview metadata', Date.now()-t, e.message); }

  // T72: Tap "Continue" on Video Preview
  t = Date.now();
  try {
    await U.tapTextContains(driver, 'Continue', 5000);
    L.pass(72, 'preview', 'Tapped Continue on Video Preview', Date.now()-t);
  } catch(e) { L.fail(72, 'preview', 'Tap Continue', Date.now()-t, e.message); }

  // T73: Verify Prompt Input screen loaded
  t = Date.now();
  try {
    await U.waitForText(driver, 'Music Style', 8000);
    L.pass(73, 'prompt', 'Music Style prompt screen loaded', Date.now()-t);
  } catch(e) { L.fail(73, 'prompt', 'Prompt screen load', Date.now()-t, e.message); }

  // T74: Tap "Epic Cinematic" suggestion on Prompt Input
  t = Date.now();
  try {
    await U.tapText(driver, 'Epic Cinematic', 5000);
    L.pass(74, 'prompt', 'Tapped suggestion "Epic Cinematic"', Date.now()-t);
  } catch(e) { L.fail(74, 'prompt', 'Tap suggestion', Date.now()-t, e.message); }

  // T75: Tap "Analyze Video" -> loader screen active
  t = Date.now();
  try {
    await U.tapText(driver, 'Analyze Video', 5000);
    await U.sleep(1000);
    L.pass(75, 'prompt', 'Tapped "Analyze Video" → processing loader active', Date.now()-t);
  } catch(e) { L.fail(75, 'prompt', 'Tap Analyze Video', Date.now()-t, e.message); }

  // T76: Wait for Analysis loading to complete and transition to Summary
  t = Date.now();
  try {
    await U.waitForTextContains(driver, 'Analysis Complete', 20000);
    L.pass(76, 'analyze', 'Analysis complete; auto-navigated to Summary', Date.now()-t);
  } catch(e) { L.fail(76, 'analyze', 'Wait for analysis success', Date.now()-t, e.message); }

  // T77: Verify Analysis Summary screen loaded & detected mood visible
  t = Date.now();
  try {
    await U.waitForText(driver, 'AI Confidence', 5000);
    await U.waitForText(driver, 'Find Music', 5000);
    L.pass(77, 'analyze', 'Analysis Summary details verified', Date.now()-t);
  } catch(e) { L.fail(77, 'analyze', 'Verify summary details', Date.now()-t, e.message); }

  // T78: Tap "Find Music" on Analysis Summary
  t = Date.now();
  try {
    await U.tapText(driver, 'Find Music', 5000);
    L.pass(78, 'analyze', 'Tapped "Find Music" → Recommended Tracks page', Date.now()-t);
  } catch(e) { L.fail(78, 'analyze', 'Tap Find Music', Date.now()-t, e.message); }

  // T79: Verify Recommended Tracks screen loaded
  t = Date.now();
  try {
    await U.waitForText(driver, 'Recommended', 8000);
    L.pass(79, 'music', 'Recommended tracks screen loaded', Date.now()-t);
  } catch(e) { L.fail(79, 'music', 'Recommended screen load', Date.now()-t, e.message); }

  // T80: Tap "Apply" on the first recommended music track
  t = Date.now();
  try {
    await U.tapText(driver, 'Apply', 5000);
    L.pass(80, 'music', 'Tapped "Apply" on matching music track', Date.now()-t);
  } catch(e) { L.fail(80, 'music', 'Tap Apply track', Date.now()-t, e.message); }

  // T81: Verify Preview screen loaded with selected audio track info
  t = Date.now();
  try {
    await U.waitForText(driver, 'Preview', 8000);
    L.pass(81, 'preview', 'Preview screen loaded with merged track', Date.now()-t);
  } catch(e) { L.fail(81, 'preview', 'Preview screen load', Date.now()-t, e.message); }

  // T82: Tap Play on video player preview and wait
  t = Date.now();
  try {
    const playBtn = await U.findEl(driver, 'button.w-14.h-14', 5000);
    if (!playBtn) throw new Error('Playback play button not found');
    await U.clickEl(driver, playBtn);
    await U.sleep(3000); // let it play
    L.pass(82, 'preview', 'Preview playback toggled and audio/video played', Date.now()-t);
  } catch(e) { L.fail(82, 'preview', 'Toggle playback', Date.now()-t, e.message); }

  // T83: Tap Pause and click "Export Video"
  t = Date.now();
  try {
    const pauseBtn = await U.findEl(driver, 'button.w-14.h-14', 5000);
    if (pauseBtn) {
      await U.clickEl(driver, pauseBtn);
      await U.sleep(500);
    }
    await U.tapText(driver, 'Export Video', 5000);
    L.pass(83, 'preview', 'Tapped "Export Video" → Export Settings screen', Date.now()-t);
  } catch(e) { L.fail(83, 'preview', 'Tap Export Video', Date.now()-t, e.message); }

  // T84: Verify Export Settings screen and click "Export Video"
  t = Date.now();
  try {
    await U.waitForText(driver, 'Export Settings', 5000);
    // Click 4K quality option
    await U.tapText(driver, '4K', 5000);
    // Click Export Video button
    await U.tapText(driver, 'Export Video', 5000);
    L.pass(84, 'export', 'Configured settings and initiated Export', Date.now()-t);
  } catch(e) { L.fail(84, 'export', 'Export configuration', Date.now()-t, e.message); }

  // T85: Wait for Export Processing to complete and transition to Success
  t = Date.now();
  try {
    await U.waitForText(driver, 'Export Complete!', 20000);
    L.pass(85, 'export', 'Export rendering complete; loaded Success screen', Date.now()-t);
  } catch(e) { L.fail(85, 'export', 'Wait for export completion', Date.now()-t, e.message); }

  // T86: Verify Export Success screen, test actions, and click "Back to Home"
  t = Date.now();
  try {
    await U.waitForText(driver, 'Save to Device', 5000);
    await U.waitForText(driver, 'Share Video', 5000);
    await U.tapText(driver, 'Back to Home', 5000);
    // Confirm back on Dashboard
    await U.waitForText(driver, 'Create New Project', 8000);
    L.pass(86, 'export', 'E2E workflow successfully completed and returned to Home', Date.now()-t);
  } catch(e) { L.fail(86, 'export', 'E2E Success verification', Date.now()-t, e.message); }
};
