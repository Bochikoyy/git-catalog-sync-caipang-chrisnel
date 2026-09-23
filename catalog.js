function isValidLoan(daysLate) {
  return daysLate >= 0;
}

function calculateLateFee(daysLate, ratePerDay) {
  const fee = Math.floor(daysLate * ratePerDay);
  return Math.min(fee, 20);
}

module.exports = { isValidLoan, calculateLateFee };