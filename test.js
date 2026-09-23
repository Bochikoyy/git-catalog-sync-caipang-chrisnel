const catalog = require('./catalog');

let failures = 0;
function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    console.error(`FAIL: ${label} — expected ${expected}, got ${actual}`);
    failures++;
  } else {
    console.log(`PASS: ${label}`);
  }
}

assertEqual(catalog.isValidLoan(3), true, 'a positive days-late value is valid');
assertEqual(catalog.isValidLoan(-1), false, 'a negative days-late value is invalid');

const fee = catalog.calculateLateFee(5, 2.25);
assertEqual(fee, 11, 'late fee for 5 days at $2.25/day');
assertEqual(catalog.calculateLateFee(15, 2), 20, 'late fee is capped at $20');

process.exitCode = failures > 0 ? 1 : 0;
