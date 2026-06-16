class Logger {
  constructor() {
    this.results = [];
    this.passed  = 0;
    this.failed  = 0;
    this.startTime = Date.now();
  }

  pass(id, suite, name, ms) {
    this.results.push({ id, suite, name, status: 'PASSED', ms, error: '' });
    this.passed++;
    console.log(`  ✅ [${String(id).padStart(3,'0')}] ${name}  (${ms}ms)`);
  }

  fail(id, suite, name, ms, error = '') {
    const short = String(error).split('\n')[0].slice(0, 140);
    this.results.push({ id, suite, name, status: 'FAILED', ms, error: short });
    this.failed++;
    console.log(`  ❌ [${String(id).padStart(3,'0')}] ${name}`);
    console.log(`      ↳ ${short}`);
  }

  summary() {
    const total   = this.passed + this.failed;
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log('\n' + '═'.repeat(60));
    console.log(`  🏁  FINAL RESULTS — Motorola Edge 50 Fusion`);
    console.log(`  ✅  Passed : ${this.passed}/${total}`);
    console.log(`  ❌  Failed : ${this.failed}/${total}`);
    console.log(`  ⏱️   Time   : ${elapsed}s`);
    console.log('═'.repeat(60) + '\n');
  }

  export() { return this.results; }
  getStats() { return { passed: this.passed, failed: this.failed, total: this.passed + this.failed, elapsed: Date.now() - this.startTime }; }
}

module.exports = Logger;
