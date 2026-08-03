import { strict as assert } from 'node:assert';
import test from 'node:test';
import { actualAmountToNok, decimalToActualAmount, formatDecimal, multiplyDecimal, parseDecimal } from '../src/money.js';

test('parses and formats decimal values', () => {
  assert.equal(formatDecimal(parseDecimal('123.456'), 2), '123.46');
  assert.equal(formatDecimal(parseDecimal('0.00000001'), 8), '0.00000001');
});

test('multiplies decimal values without floating point drift', () => {
  const value = multiplyDecimal(parseDecimal('0.5'), parseDecimal('100.25'));
  assert.equal(formatDecimal(value, 3), '50.125');
});

test('converts NOK values to Actual amount cents', () => {
  assert.equal(decimalToActualAmount(parseDecimal('10.1234')), 1012);
  assert.equal(decimalToActualAmount(parseDecimal('10.125')), 1013);
  assert.equal(actualAmountToNok(2362216), '23622.16');
});
