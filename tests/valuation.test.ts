import { strict as assert } from 'node:assert';
import test from 'node:test';
import { valuePortfolio } from '../src/valuation.js';

test('values NOK and crypto holdings in NOK', () => {
  const valuation = valuePortfolio(
    [
      { currency: 'NOK', balance: '100.00', hold: '0', available: '100.00' },
      { currency: 'BTC', balance: '0.01', hold: '0', available: '0.01' },
      { currency: 'ETH', balance: '0', hold: '0', available: '0' },
    ],
    [{ id: 'BTCNOK', last: '1000000.00', high: '0', change: '0', low: '0', volume: '0' }],
  );

  assert.equal(valuation.totalNok, '10100.00');
  assert.equal(valuation.totalActualAmount, 1010000);
  assert.equal(valuation.holdings.length, 2);
});

test('fails for non-zero holdings without a NOK market', () => {
  assert.throws(
    () => valuePortfolio([{ currency: 'DOGE', balance: '1', hold: '0', available: '1' }], []),
    /No NOK market/,
  );
});
