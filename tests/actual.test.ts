import { strict as assert } from 'node:assert';
import test from 'node:test';
import { calculateAdjustment, sumTransactionAmounts } from '../src/actual.js';

test('calculates first daily adjustment from current balance', () => {
  assert.equal(calculateAdjustment(1000, 0, 1500), 500);
});

test('recalculates same-day adjustment by removing existing adjustment first', () => {
  assert.equal(calculateAdjustment(1500, 500, 1750), 750);
});

test('sums transaction amounts for off-budget current balance', () => {
  assert.equal(sumTransactionAmounts([{ amount: 10_000 }, { amount: -2_500 }, { amount: 5_000 }]), 12_500);
});
