import { strictEqual } from 'node:assert';
import test from 'node:test';

import { loadConfig } from '../src/config.js';

const baseEnv = {
  ACTUAL_SERVER_URL: 'https://actual.example.com',
  ACTUAL_PASSWORD: 'example-actual-password',
  ACTUAL_SYNC_ID: '00000000-0000-0000-0000-000000000000',
  FIRI_API_KEY: 'example-api-key',
  FIRI_CLIENT_ID: 'example-client-id',
  FIRI_SECRET_KEY: 'example-secret-key',
};

test('uses write-mode and UTC defaults', () => {
  const config = loadConfig(baseEnv);

  strictEqual(config.dryRun, false);
  strictEqual(config.timeZone, 'UTC');
});

test('allows dry-run and time zone overrides', () => {
  const config = loadConfig({
    ...baseEnv,
    DRY_RUN: 'true',
    TZ: 'Europe/Oslo',
  });

  strictEqual(config.dryRun, true);
  strictEqual(config.timeZone, 'Europe/Oslo');
});
