const results = [];

function logPass(id, suite, name, duration) {
  results.push({
    id,
    suite,
    name,
    status: 'PASSED',
    duration,
    error: '',
    screenshot: ''
  });
  console.log(`  ✅ Test ${id} [${suite}]: ${name} (${duration}ms)`);
}

function logFail(id, suite, name, duration, error, screenshot) {
  results.push({
    id,
    suite,
    name,
    status: 'FAILED',
    duration,
    error: error || 'Unknown Error',
    screenshot: screenshot || ''
  });
  console.log(`  ❌ Test ${id} [${suite}]: ${name} (${duration}ms) - Error: ${error}`);
}

function logSkip(id, suite, name) {
  results.push({
    id,
    suite,
    name,
    status: 'SKIPPED',
    duration: 0,
    error: '',
    screenshot: ''
  });
  console.log(`  ⏭️ Test ${id} [${suite}]: ${name} (SKIPPED)`);
}

function exportResults() {
  return results;
}

module.exports = {
  logPass,
  logFail,
  logSkip,
  exportResults
};
