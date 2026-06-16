/**
 * Excel Report Generator — SyncTune AI Mobile E2E Tests
 * Generates a rich Excel workbook with:
 *   - Summary sheet (pass/fail counts, device info, timestamp)
 *   - Detailed results sheet (per-test row with color coding)
 *   - Suite breakdown sheet (grouped by suite)
 */

const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

const COLORS = {
  headerBg:   '1A1A2E',
  headerFont: 'FFFFFF',
  passed:     '22C55E',
  failed:     'EF4444',
  suiteRow:   '7C3AED',
  summaryBg:  '0F0F1A',
  altRow:     '1E1E3A',
  white:      'FFFFFF',
  yellow:     'FBBF24',
  cyan:       '06B6D4',
};

function styleHeader(row) {
  row.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    cell.font   = { bold: true, color: { argb: COLORS.headerFont }, name: 'Calibri', size: 11 };
    cell.border = { bottom: { style: 'medium', color: { argb: COLORS.suiteRow } } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
}

async function generateReport(results, stats, outDir) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const timestamp  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename   = `SyncTune_E2E_Report_${timestamp}.xlsx`;
  const outPath    = path.join(outDir, filename);

  const wb = new ExcelJS.Workbook();
  wb.creator  = 'SyncTune AI Test Suite';
  wb.created  = new Date();
  wb.modified = new Date();

  // ─── SHEET 1: SUMMARY ────────────────────────────────────────────────────
  const summary = wb.addWorksheet('📊 Summary');
  summary.columns = [
    { key: 'key',   width: 30 },
    { key: 'value', width: 40 },
  ];

  const summaryData = [
    ['SyncTune AI — E2E Mobile Test Report', ''],
    ['', ''],
    ['Device',          'Motorola Edge 50 Fusion'],
    ['Device Serial',   'ZA222RK25H'],
    ['App Package',     'com.synctune.app'],
    ['App Name',        'SyncTune AI (magic pattern)'],
    ['Test Date',       new Date().toLocaleString()],
    ['Framework',       'Appium + WebdriverIO v8 (UiAutomator2)'],
    ['', ''],
    ['Total Tests',     stats.total],
    ['✅ Passed',        stats.passed],
    ['❌ Failed',        stats.failed],
    ['Pass Rate',       `${((stats.passed / stats.total) * 100).toFixed(1)}%`],
    ['Total Duration',  `${(stats.elapsed / 1000).toFixed(1)}s`],
  ];

  for (const [key, value] of summaryData) {
    const row = summary.addRow({ key, value });
    if (key === 'SyncTune AI — E2E Mobile Test Report') {
      row.getCell('key').font = { bold: true, size: 14, color: { argb: COLORS.cyan } };
      summary.mergeCells(`A${row.number}:B${row.number}`);
    } else if (key === '✅ Passed') {
      row.getCell('value').font = { bold: true, color: { argb: COLORS.passed } };
    } else if (key === '❌ Failed') {
      row.getCell('value').font = { bold: true, color: { argb: COLORS.failed } };
    } else if (key === 'Pass Rate') {
      const pct = parseFloat(value);
      row.getCell('value').font = { bold: true, color: { argb: pct >= 80 ? COLORS.passed : COLORS.failed } };
    } else if (key !== '') {
      row.getCell('key').font = { bold: false, color: { argb: 'AAAAAA' } };
    }
    row.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D0D1F' } };
    });
  }
  summary.getRow(1).height = 30;

  // ─── SHEET 2: DETAILED RESULTS ───────────────────────────────────────────
  const ws = wb.addWorksheet('📋 Test Results');
  ws.columns = [
    { header: '#',          key: 'id',     width: 6  },
    { header: 'Suite',      key: 'suite',  width: 18 },
    { header: 'Test Name',  key: 'name',   width: 58 },
    { header: 'Status',     key: 'status', width: 12 },
    { header: 'Time (ms)',  key: 'ms',     width: 12 },
    { header: 'Error',      key: 'error',  width: 55 },
  ];
  ws.getRow(1).height = 22;
  styleHeader(ws.getRow(1));

  let lastSuite = '';
  for (const [i, r] of results.entries()) {
    // Suite group header row
    if (r.suite !== lastSuite) {
      lastSuite = r.suite;
      const gr = ws.addRow({ id: '', suite: r.suite.toUpperCase(), name: `— ${r.suite.toUpperCase()} TESTS —`, status: '', ms: '', error: '' });
      gr.eachCell(c => {
        c.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.suiteRow } };
        c.font   = { bold: true, color: { argb: COLORS.white } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    }

    const row = ws.addRow({ id: r.id, suite: r.suite, name: r.name, status: r.status, ms: r.ms, error: r.error || '' });
    const bg  = i % 2 === 0 ? '111127' : '1A1A30';
    row.eachCell(c => {
      c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.font      = { color: { argb: COLORS.white }, size: 10 };
      c.alignment = { vertical: 'middle', wrapText: true };
    });
    // Status cell
    const statusCell = row.getCell('status');
    statusCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: r.status === 'PASSED' ? COLORS.passed : COLORS.failed } };
    statusCell.font  = { bold: true, color: { argb: COLORS.white }, size: 10 };
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    // ID cell
    row.getCell('id').alignment = { horizontal: 'center', vertical: 'middle' };
    // Time cell
    row.getCell('ms').alignment = { horizontal: 'right', vertical: 'middle' };
    row.height = 18;
  }
  ws.autoFilter = { from: 'A1', to: 'F1' };
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  // ─── SHEET 3: SUITE BREAKDOWN ─────────────────────────────────────────────
  const breakdown = wb.addWorksheet('📈 Suite Breakdown');
  breakdown.columns = [
    { header: 'Suite',        key: 'suite',   width: 22 },
    { header: 'Total',        key: 'total',   width: 10 },
    { header: 'Passed',       key: 'passed',  width: 10 },
    { header: 'Failed',       key: 'failed',  width: 10 },
    { header: 'Pass Rate',    key: 'rate',    width: 12 },
    { header: 'Avg Time(ms)', key: 'avg',     width: 14 },
  ];
  breakdown.getRow(1).height = 22;
  styleHeader(breakdown.getRow(1));

  const suiteMap = {};
  for (const r of results) {
    if (!suiteMap[r.suite]) suiteMap[r.suite] = { total: 0, passed: 0, failed: 0, totalMs: 0 };
    suiteMap[r.suite].total++;
    suiteMap[r.suite][r.status === 'PASSED' ? 'passed' : 'failed']++;
    suiteMap[r.suite].totalMs += r.ms;
  }
  for (const [suite, s] of Object.entries(suiteMap)) {
    const rate = ((s.passed / s.total) * 100).toFixed(1) + '%';
    const avg  = Math.round(s.totalMs / s.total);
    const row  = breakdown.addRow({ suite, total: s.total, passed: s.passed, failed: s.failed, rate, avg });
    row.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '111127' } };
      c.font = { color: { argb: COLORS.white }, size: 10 };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    row.getCell('suite').alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell('passed').font = { bold: true, color: { argb: COLORS.passed }, size: 10 };
    row.getCell('failed').font = { bold: true, color: { argb: s.failed > 0 ? COLORS.failed : COLORS.passed }, size: 10 };
    const pctVal = parseFloat(rate);
    row.getCell('rate').font = { bold: true, color: { argb: pctVal >= 80 ? COLORS.passed : COLORS.failed }, size: 10 };
    row.height = 20;
  }

  await wb.xlsx.writeFile(outPath);
  console.log(`\n📊 Excel report saved:\n   ${outPath}\n`);
  return outPath;
}

module.exports = { generateReport };
