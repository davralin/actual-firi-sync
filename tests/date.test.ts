import { strictEqual } from 'node:assert';
import test from 'node:test';

import { localDateString } from '../src/date.js';

test('formats dates in the configured time zone', () => {
  strictEqual(localDateString(new Date('2026-08-02T22:30:00.000Z'), 'Europe/Oslo'), '2026-08-03');
  strictEqual(localDateString(new Date('2026-08-02T22:30:00.000Z'), 'UTC'), '2026-08-02');
});
