export type Config = {
  actual: {
    serverUrl: string;
    password: string;
    syncId: string;
    dataDir: string;
    accountName: string;
    createAccount: boolean;
  };
  firi: {
    apiBase: string;
    apiKey: string;
    clientId: string;
    secretKey: string;
    signatureValidity: string;
  };
  dryRun: boolean;
  valuationPrice: 'last';
  timeZone: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    actual: {
      serverUrl: required(env, 'ACTUAL_SERVER_URL'),
      password: required(env, 'ACTUAL_PASSWORD'),
      syncId: required(env, 'ACTUAL_SYNC_ID'),
      dataDir: env.ACTUAL_DATA_DIR || '/app/cache',
      accountName: env.ACTUAL_ACCOUNT_NAME || 'Firi',
      createAccount: parseBoolean(env.ACTUAL_CREATE_ACCOUNT, false),
    },
    firi: {
      apiBase: env.FIRI_API_BASE || 'https://api.firi.com',
      apiKey: required(env, 'FIRI_API_KEY'),
      clientId: required(env, 'FIRI_CLIENT_ID'),
      secretKey: required(env, 'FIRI_SECRET_KEY'),
      signatureValidity: env.FIRI_SIGNATURE_VALIDITY || '2000',
    },
    dryRun: parseBoolean(env.DRY_RUN, false),
    valuationPrice: 'last',
    timeZone: env.TZ || 'UTC',
  };
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  if (['1', 'true', 'yes'].includes(value.toLowerCase())) {
    return true;
  }
  if (['0', 'false', 'no'].includes(value.toLowerCase())) {
    return false;
  }
  throw new Error(`Invalid boolean value: ${value}`);
}
