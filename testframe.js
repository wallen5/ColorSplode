const TESTS = [];

function test(name, fn) {
  TESTS.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

function runTests() {
  console.log("Running tests...");
  let passed = 0;

  for (const t of TESTS) {
    try {
      t.fn();
      console.log(`✔ ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`✘ ${t.name}`);
      console.error("    " + err.message);
    }
  }

  console.log(`\n${passed}/${TESTS.length} tests passed.`);
}