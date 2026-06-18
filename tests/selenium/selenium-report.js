const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateReport(results) {
  const workbook = new ExcelJS.Workbook();
  const reportPath = path.join(__dirname, 'selenium-report.xlsx');

  // Ensure output directory exists
  const outputDir = path.dirname(reportPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Calculate statistics
  const totalTests = 215;
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const skipped = totalTests - passed - failed;
  const passRate = Math.round((passed / totalTests) * 100);
  const totalDuration = results.reduce((acc, r) => acc + (r.duration || 0), 0) / 1000;

  // ---------------------------------------------------------
  // SHEET 1: Summary Dashboard
  // ---------------------------------------------------------
  const sh1 = workbook.addWorksheet('Summary Dashboard');
  sh1.views = [{ state: 'frozen', ySplit: 1 }];

  sh1.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 45 }
  ];

  const testDateStr = new Date().toLocaleString();

  sh1.addRows([
    { metric: 'App Name', value: 'SyncTune AI' },
    { metric: 'Test Date', value: testDateStr },
    { metric: 'Total Tests', value: totalTests },
    { metric: 'Passed', value: passed },
    { metric: 'Failed', value: failed },
    { metric: 'Skipped', value: skipped },
    { metric: 'Pass Rate %', value: `${passRate}%` },
    { metric: 'Total Duration', value: `${totalDuration.toFixed(2)} seconds` },
    { metric: 'Web URL', value: 'http://localhost:5173' },
    { metric: 'Backend URL', value: 'http://localhost:5000' }
  ]);

  // Styling sheet 1 headers
  sh1.getRow(1).eachCell(c => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  });

  // Apply conditional formatting on sheet 1 cells
  sh1.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const metricCell = row.getCell(1);
    const valueCell = row.getCell(2);

    metricCell.font = { bold: true };

    if (metricCell.value === 'Passed') {
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      valueCell.font = { color: { argb: 'FF006100' }, bold: true };
    } else if (metricCell.value === 'Failed') {
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
      valueCell.font = { color: { argb: 'FF9C0006' }, bold: true };
    } else if (metricCell.value === 'Skipped') {
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
      valueCell.font = { color: { argb: 'FF9C6500' }, bold: true };
    } else if (metricCell.value === 'Pass Rate %') {
      let color = 'FFFF0000'; // red
      if (passRate >= 80) color = 'FF70AD47'; // green
      else if (passRate >= 50) color = 'FFFFD966'; // yellow

      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      valueCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    }
  });

  // ---------------------------------------------------------
  // SHEET 2: Full Test Results
  // ---------------------------------------------------------
  const sh2 = workbook.addWorksheet('Full Test Results');
  sh2.views = [{ state: 'frozen', ySplit: 1 }];

  sh2.columns = [
    { header: '#', key: 'id', width: 6 },
    { header: 'Suite', key: 'suite', width: 25 },
    { header: 'Test Case Name', key: 'name', width: 50 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration(ms)', key: 'duration', width: 14 },
    { header: 'Error Message', key: 'error', width: 35 },
    { header: 'Screenshot Path', key: 'screenshot', width: 40 }
  ];

  // Populate 215 test results (or placeholders if some tests didn't run)
  for (let i = 1; i <= 215; i++) {
    const matched = results.find(r => r.id === i);
    if (matched) {
      sh2.addRow(matched);
    } else {
      sh2.addRow({
        id: i,
        suite: getSuiteName(i),
        name: getTestName(i),
        status: 'SKIPPED',
        duration: 0,
        error: '',
        screenshot: ''
      });
    }
  }

  // Styling sheet 2 headers
  sh2.getRow(1).eachCell(c => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  });

  // Color rows based on status
  sh2.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const statusCell = row.getCell(4);
    let color = 'FFFFFFFF';
    let textColor = 'FF000000';

    if (statusCell.value === 'PASSED') {
      color = 'FFC6EFCE';
      textColor = 'FF006100';
    } else if (statusCell.value === 'FAILED') {
      color = 'FFFFC7CE';
      textColor = 'FF9C0006';
    } else if (statusCell.value === 'SKIPPED') {
      color = 'FFFFEB9C';
      textColor = 'FF9C6500';
    }

    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      if (cell.col === 4) {
        cell.font = { color: { argb: textColor }, bold: true };
      }
    });
  });

  // ---------------------------------------------------------
  // SHEET 3: Suite Breakdown
  // ---------------------------------------------------------
  const sh3 = workbook.addWorksheet('Suite Breakdown');
  sh3.views = [{ state: 'frozen', ySplit: 1 }];

  sh3.columns = [
    { header: 'Suite Name', key: 'suiteName', width: 28 },
    { header: 'Total', key: 'totalName', width: 10 },
    { header: 'Passed', key: 'passedName', width: 10 },
    { header: 'Failed', key: 'failedName', width: 10 },
    { header: 'Pass %', key: 'pct', width: 12 }
  ];

  const suiteList = [
    { name: 'Initial Page Load & UI', start: 1, end: 10 },
    { name: 'Registration Flow', start: 11, end: 25 },
    { name: 'Login Validation', start: 26, end: 40 },
    { name: 'Forgot Password', start: 41, end: 50 },
    { name: 'Dashboard Layout', start: 51, end: 60 },
    { name: 'New Project & Upload', start: 61, end: 75 },
    { name: 'Recommended Tracks', start: 76, end: 90 },
    { name: 'Export Configuration & Flow', start: 91, end: 100 },
    { name: 'Profile Settings', start: 101, end: 105 },
    { name: 'Navigation & Session', start: 106, end: 110 },
    { name: 'Extended Feature Suite', start: 111, end: 215 }
  ];

  suiteList.forEach(s => {
    const total = s.end - s.start + 1;
    let sPassed = 0;
    let sFailed = 0;
    for (let idx = s.start; idx <= s.end; idx++) {
      const match = results.find(r => r.id === idx);
      if (match) {
        if (match.status === 'PASSED') sPassed++;
        if (match.status === 'FAILED') sFailed++;
      }
    }
    const pctVal = total > 0 ? Math.round((sPassed / total) * 100) : 0;
    sh3.addRow({
      suiteName: s.name,
      totalName: total,
      passedName: sPassed,
      failedName: sFailed,
      pct: `${pctVal}%`
    });
  });

  sh3.getRow(1).eachCell(c => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  });

  // Apply colors to breakdown sheet pct column
  sh3.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const pctCell = row.getCell(5);
    const val = parseInt(pctCell.value);
    let color = 'FFFF0000'; // red
    if (val >= 80) color = 'FFC6EFCE'; // light green
    else if (val >= 50) color = 'FFFFEB9C'; // light yellow

    pctCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    pctCell.font = { bold: true };
  });

  // ---------------------------------------------------------
  // SHEET 4: Failed Tests Detail
  // ---------------------------------------------------------
  const sh4 = workbook.addWorksheet('Failed Tests Detail');
  sh4.views = [{ state: 'frozen', ySplit: 1 }];

  sh4.columns = [
    { header: '#', key: 'id', width: 6 },
    { header: 'Test Case Name', key: 'name', width: 45 },
    { header: 'Error Message', key: 'error', width: 35 },
    { header: 'Stack Trace', key: 'stack', width: 45 },
    { header: 'Suggested Fix', key: 'fix', width: 50 }
  ];

  const failedList = results.filter(r => r.status === 'FAILED');
  if (failedList.length === 0) {
    sh4.addRow({
      id: '-',
      name: 'All test cases passed successfully!',
      error: '',
      stack: '',
      fix: ''
    });
  } else {
    failedList.forEach(f => {
      sh4.addRow({
        id: f.id,
        name: f.name,
        error: f.error,
        stack: f.stack || 'No Stack Trace',
        fix: getSuggestedFix(f.id, f.error)
      });
    });
  }

  sh4.getRow(1).eachCell(c => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  });

  // Styling row text red for failed list
  sh4.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    row.getCell(3).font = { color: { argb: 'FF9C0006' } };
  });

  // ---------------------------------------------------------
  // Common Borders & Width Adjustments
  // ---------------------------------------------------------
  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
    left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
    bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
    right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
  };

  [sh1, sh2, sh3, sh4].forEach(ws => {
    ws.eachRow(row => {
      row.eachCell(cell => {
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle', horizontal: cell.col === 1 ? 'left' : 'left' };
      });
    });
  });

  await workbook.xlsx.writeFile(reportPath);
  console.log(`\n📊 Excel report created successfully at: ${reportPath}`);
}

function getSuiteName(id) {
  if (id <= 10) return 'Initial Page Load & UI';
  if (id <= 25) return 'Registration Flow';
  if (id <= 40) return 'Login Validation';
  if (id <= 50) return 'Forgot Password';
  if (id <= 60) return 'Dashboard Layout';
  if (id <= 75) return 'New Project & Upload';
  if (id <= 90) return 'Recommended Tracks';
  if (id <= 100) return 'Export Configuration & Flow';
  if (id <= 105) return 'Profile Settings';
  if (id <= 110) return 'Navigation & Session';
  return 'Extended Feature Suite';
}

function getTestName(id) {
  const names = {
    1: 'Navigate to http://localhost:5173 — verify page loads and redirects to /sign-in',
    2: 'Verify page title contains "SyncTune"',
    3: 'Verify SyncTune logo/icon is visible on sign-in page',
    4: 'Verify "Welcome Back" heading text is visible',
    5: 'Verify "Sign in to continue to SyncTune AI" subheading is visible',
    6: 'Verify Email input field is visible and interactable',
    7: 'Verify Password input field is visible and type="password"',
    8: 'Verify "Sign In" button is visible and enabled',
    9: 'Verify "Forgot Password?" link is visible',
    10: 'Verify "Continue with Google" button is visible at bottom of form',
    11: 'Navigate to http://localhost:5173/register',
    12: 'Verify "Create Account" heading is visible',
    13: 'Verify "Join SyncTune AI today" subheading is visible',
    14: 'Verify Full Name input field is present',
    15: 'Verify Email input field is present',
    16: 'Verify Password input field is present',
    17: 'Verify "I agree to the Terms of Service and Privacy Policy" checkbox is present',
    18: 'Verify "Create Account" button is present',
    19: 'Click Create Account with all empty fields — verify validation errors appear',
    20: 'Type invalid email "wrongemail6789" in email field — verify email validation error',
    21: 'Type short password "123" — verify password strength/error shown',
    22: 'Fill all fields correctly',
    23: 'Check the "I agree to Terms of Service and Privacy Policy" checkbox',
    24: 'Click "Create Account" button — verify success or redirect to /home',
    25: 'Try registering again with same email "selenium.test.synctune@gmail.com" — verify "already exists" error',
    26: 'Navigate to http://localhost:5173/sign-in',
    27: 'Click Sign In button with completely empty fields — verify error shown',
    28: 'Enter only email "saisr3058@gmail.com" with empty password — click Sign In — verify error',
    29: 'Enter wrong email "wrongemail6789" and wrong password "wrongpass999"',
    30: 'Click Sign In — verify error message appears on screen',
    31: 'Verify user stays on /sign-in page',
    32: 'Clear both fields — wait 2500ms',
    33: 'Enter correct email "saisr3058@gmail.com" and wrong password "wrongpass999"',
    34: 'Click Sign In — verify error message appears',
    35: 'Verify still on /sign-in page',
    36: 'Clear both fields again — wait 2500ms',
    37: 'Enter correct email "saisr3058@gmail.com"',
    38: 'Enter correct password "123456"',
    39: 'Click "Sign In" button slowly',
    40: 'Wait for URL to contain /home — verify dashboard loaded successfully',
    41: 'If currently logged in — find logout option and log out — navigate to /sign-in',
    42: 'Verify sign-in page is shown',
    43: 'Click "Forgot Password?" link',
    44: 'Verify forgot password page or modal opens',
    45: 'Enter email "saisr3058@gmail.com" in the forgot password input field',
    46: 'Click "Send Reset Link" or submit button',
    47: 'Verify success message appears on screen',
    48: 'Call POST http://localhost:5000/api/auth/reset-password',
    49: 'Verify API returns 200 OK',
    50: 'Navigate to /sign-in — login with email "saisr3058@gmail.com" password "123456" — verify success',
    51: 'Ensure logged in as saisr3058@gmail.com — verify URL is /home',
    52: 'Verify "SyncTune" text/logo is visible in top navbar',
    53: 'Verify "Home" nav link is present and visible',
    54: 'Verify "Projects" nav link is present and visible',
    55: 'Verify "+ New Project" button is present in navbar',
    56: 'Verify "Profile" nav link is present and visible',
    57: 'Verify "Create New Project" banner/card is visible in center of page',
    58: 'Verify "Recent Projects" section heading is visible',
    59: 'Verify at least one project card exists showing a mood badge (Happy/Cinematic/etc)',
    60: 'Verify project cards show "Completed" status badge',
    61: 'Click the "Create New Project" banner or "+ New Project" button from dashboard',
    62: 'Verify the video upload page opens',
    63: 'Verify video upload drop zone is visible',
    64: 'Programmatically create test_video.mp4 in test-assets/',
    65: 'Find the file input element and send the full path of test_video.mp4',
    66: 'Verify upload progress indicator or loading spinner appears',
    67: 'Verify video thumbnail/preview appears after upload',
    68: 'Verify frame analysis loading state is visible',
    69: 'Wait up to 30 seconds for mood detection to complete',
    70: 'Verify detected mood is displayed (happy/sad/energetic/calm/cinematic)',
    71: 'Verify energy level is displayed (low/medium/high)',
    72: 'Verify app navigates to /recommended-tracks after analysis completes',
    73: 'Verify page heading or content confirms recommended tracks page',
    74: 'Verify at least 3 music track cards are shown',
    75: 'Verify each track card shows: name, BPM badge, mood tag, match percentage, Apply button',
    76: 'Verify filter tabs are visible: Best Match, Energetic, Calm, Cinematic, Happy, Sad',
    77: 'Verify "Best Match" tab is active/selected by default',
    78: 'Click "Energetic" tab — verify tracks list updates',
    79: 'Click "Calm" tab — verify tracks list updates',
    80: 'Click "Cinematic" tab — verify tracks list updates',
    81: 'Click "Happy" tab — verify tracks list updates',
    82: 'Click "Sad" tab — verify tracks list updates',
    83: 'Click "Best Match" tab — verify all top tracks shown again',
    84: 'Click play button (▶) on the first track — verify mini player appears at bottom',
    85: 'Verify mini player shows the track name that was clicked',
    86: 'Click pause button on mini player — verify playback stops',
    87: 'Click play again — verify playback resumes',
    88: 'Click "Apply" button on the first track in the list',
    89: 'Verify track is marked as selected or apply confirms',
    90: 'Verify navigation proceeds to /export-settings page',
    91: 'Verify "Export Settings" heading is visible on page',
    92: 'Verify Video Quality section shows: 720p, 1080p, 4K buttons',
    93: 'Click "1080p" — verify it becomes selected/highlighted',
    94: 'Verify Format section shows: MP4, MOV, AVI buttons',
    95: 'Click "MP4" — verify it is selected',
    96: 'Verify Audio Quality section shows: 128kbps, 256kbps, 320kbps',
    97: 'Click "320kbps" — verify it is selected',
    98: 'Verify "Include Watermark" toggle switch is present',
    99: 'Verify "Estimated File Size" value is displayed on screen',
    100: 'Click "Export Video" button — verify export completes successfully',
    101: 'Click "Profile" in the navbar — verify /profile page loads',
    102: 'Verify user email "saisr3058@gmail.com" is displayed on profile page',
    103: 'Verify profile picture or avatar upload button is present',
    104: 'Verify "Save Changes" button is present on profile page',
    105: 'Click "Save Changes" button — verify success toast or no error shown',
    106: 'Click "Projects" in navbar — verify /projects page loads showing project list',
    107: 'LOGOUT TEST — find logout button — click it — verify redirect to /sign-in',
    108: 'LOGIN AGAIN TEST — enter correct credentials — verify redirect to /home',
    109: 'Navigate directly to /home by typing URL without being logged in — verify redirect to /sign-in',
    110: 'Navigate to unknown route — verify either 404 page shown OR redirect to /sign-in'
  };
  if (names[id]) return names[id];

  const extendedNames = {
    111: "Simulate mobile portrait resolution (375x812) — verify page adapts",
    112: "Simulate tablet portrait resolution (768x1024) — verify layout adjusts",
    113: "Simulate mobile landscape resolution (812x375) — verify scroll container",
    114: "Verify html base element has correct lang attribute",
    115: "Verify meta charset is UTF-8",
    116: "Verify viewport meta tag is present with initial-scale",
    117: "Check body element font loading state",
    118: "Validate main layout root element width boundaries",
    119: "Check page alignment class configurations",
    120: "Verify focus outline configuration styles",
    121: "Verify aria-label or accessible name for logo elements",
    122: "Verify input fields have corresponding label elements",
    123: "Check button click state accessibility parameters",
    124: "Verify color contrast placeholders match accessibility standards",
    125: "Ensure form submissions do not trigger page refresh loops",
    126: "Verify interactive cards have correct pointer cursor styles",
    127: "Ensure loading spinner has appropriate hidden text descriptions",
    128: "Verify overlay modal backdrop opacity values",
    129: "Check modal container centering constraints",
    130: "Verify navigation links are properly indexed",
    131: "Input email with leading space — verify normalization",
    132: "Input email with trailing space — verify trim behaviour",
    133: "Input password exceeding normal limit — verify maxlength constraints",
    134: "Check password strength UI feedback values",
    135: "Verify email validation handles multiple domain dots",
    136: "Test email input with subaddressing symbols (+)",
    137: "Verify password field toggles visibility correctly",
    138: "Check input borders highlight on active validation failures",
    139: "Validate submit buttons show loading state when clicked",
    140: "Verify error message container displays when validations fail",
    141: "Ensure email field doesn't trigger unexpected autofill overlap",
    142: "Verify submit button disabled state when agreement checkbox is unchecked",
    143: "Ensure back button in registration form retains previous valid fields",
    144: "Check input fields allow paste clipboard actions",
    145: "Check input fields allow select-all keyboard shortcuts",
    146: "Verify forward browser navigation after redirect",
    147: "Verify back browser navigation after redirect",
    148: "Ensure direct URL routing to sign-in works correctly",
    149: "Ensure direct URL routing to register works correctly",
    150: "Verify relative assets resolution paths",
    151: "Validate correct query parameter matching",
    152: "Check routing response times stay within standard limits",
    153: "Verify page state is cleared upon user sign out",
    154: "Validate local storage clears correctly upon token expiry",
    155: "Check session token matches JWT structure format",
    156: "Verify session header is present in API requests",
    157: "Check token header format scheme (Bearer)",
    158: "Ensure token is stored securely in cookie or storage",
    159: "Check session storage limits constraints",
    160: "Verify session sync handler runs on startup",
    161: "Verify toggle themes update the theme cookies",
    162: "Verify layout style uses standard grid or flex alignment",
    163: "Verify primary theme color matches CSS custom properties",
    164: "Verify secondary accent colors load correctly",
    165: "Validate main page content container padding values",
    166: "Verify header nav items hover background transitions",
    167: "Verify dashboard project grid item spacing",
    168: "Verify dashboard project hover cards elevation styles",
    169: "Verify empty project list placeholder graphic is visible",
    170: "Check new project button click delay times",
    171: "Validate mood badge colors match mood status levels",
    172: "Verify status badge borders align properly",
    173: "Verify audio track BPM values show as digits",
    174: "Verify apply button switches to active configuration",
    175: "Verify play buttons show pause icon during track playback",
    176: "Verify pause buttons show play icon when track is paused",
    177: "Check volume slider changes adjust audio playback volume",
    178: "Verify track time elapsed counter updates correctly",
    179: "Verify track total duration matches metadata values",
    180: "Ensure music player is hidden when no track is selected",
    181: "Verify video export 1080p selection updates file prediction",
    182: "Verify video export 720p selection updates file prediction",
    183: "Verify video export 4K selection updates file prediction",
    184: "Verify export format MP4 writes correct filename extension",
    185: "Verify export format MOV writes correct filename extension",
    186: "Verify export format AVI writes correct filename extension",
    187: "Verify audio bitrates values scale proportionally",
    188: "Ensure watermark checkbox state updates preview rendering",
    189: "Verify export progress animation duration is within bounds",
    190: "Verify export success modal contains a close button",
    191: "Verify profile save changes validation message appears",
    192: "Check user avatar handles mock file uploads",
    193: "Verify profile update API receives correct parameters",
    194: "Ensure navigation between tabs does not lose unsaved profile edits",
    195: "Validate toast notification shows correctly after profile save",
    196: "Verify toast notification fades out after display interval",
    197: "Check user settings allows email notification toggles",
    198: "Verify security tab matches account access details",
    199: "Verify connected accounts shows integration status",
    200: "Ensure developer credentials section is restricted",
    201: "Check app load behaves when window is resized dynamically",
    202: "Verify double click on submit button is handled correctly",
    203: "Verify context menu actions do not crash player layout",
    204: "Check app responds properly to offline network state",
    205: "Verify app handles network restoration dynamically",
    206: "Verify invalid JWT signature rejection behaviour",
    207: "Verify page redirection loop protection is active",
    208: "Validate image element fallback source tags",
    209: "Ensure CSS animations do not cause excessive layout reflows",
    210: "Check font display swap behaviour in CSS variables",
    211: "Verify localStorage handles quota exceptions",
    212: "Verify script async loading properties",
    213: "Ensure CSS variables support custom theme presets",
    214: "Check system performance marks exist in console logs",
    215: "Verify general application bundle is production-ready"
  };
  return extendedNames[id] || 'Unknown Test';
}

function getSuggestedFix(id, errorText) {
  const err = (errorText || '').toLowerCase();
  if (err.includes('timeout') || err.includes('waiting for')) {
    return 'Check if the element selector has changed in the source files or increase the driver wait time.';
  }
  if (err.includes('no such element')) {
    return 'Verify that the element exists in the current page DOM and is loaded in the layout.';
  }
  if (err.includes('alert')) {
    return 'Verify if a browser alert dialog is blocking input actions and accept it using driver.switchTo().alert().';
  }
  if (id === 1) return 'Verify that the client React Vite server is started at http://localhost:5173.';
  if (id === 48) return 'Verify that the node_backend Server is started at http://localhost:5000 and the DB connection is operational.';
  if (id === 64) return 'Ensure ffmpeg is installed in system environment variables (PATH) to dynamically build media files.';
  return 'Verify DOM locator or check server API logs for potential backend payload/validation rejections.';
}

module.exports = { generateReport };
