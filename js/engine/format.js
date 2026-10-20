// Number formatting for display and copying. Pure function: no DOM.
//
// Rules (DESIGN.md §3):
//   - up to 10 significant digits, trailing zeros trimmed
//   - scientific notation below 1e-6 or at/above 1e15
//   - output is always a plain number string that our own input accepts back
//     (no thousands separators), so a copied result can be pasted in again
//
// Also hides floating-point noise: 0.1 + 0.2 = 0.30000000000000004 → "0.3".

const SMALL = 1e-6;
const LARGE = 1e15;

export function formatNumber(value, significantDigits = 10) {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Cannot format non-finite number: ${value}`);
  }
  if (value === 0) return '0'; // also turns -0 into "0"

  const magnitude = Math.abs(value);

  if (magnitude < SMALL || magnitude >= LARGE) {
    // "1.500000000e+20" → "1.5e+20"
    return value
      .toExponential(significantDigits - 1)
      .replace(/\.?0+e/, 'e');
  }

  // Round to N significant digits, then let Number() drop trailing zeros.
  return String(Number(value.toPrecision(significantDigits)));
}
