import { createHmac } from 'node:crypto';

export type FiriBalance = {
  currency: string;
  balance: string;
  hold: string;
  available: string;
};

export type FiriMarket = {
  id: string;
  last: string;
  high: string;
  change: string;
  low: string;
  volume: string;
};

export type FiriClientOptions = {
  apiBase: string;
  apiKey: string;
  clientId: string;
  secretKey: string;
  signatureValidity: string;
};

export class FiriClient {
  constructor(private readonly options: FiriClientOptions) {}

  async getBalances(): Promise<FiriBalance[]> {
    return this.getPrivate('/v2/balances');
  }

  async getMarkets(): Promise<FiriMarket[]> {
    return this.getPublic('/v2/markets');
  }

  private async getPublic<T>(path: string): Promise<T> {
    return this.request(path);
  }

  private async getPrivate<T>(path: string): Promise<T> {
    const timestamp = Math.round(Date.now() / 1000).toString();
    const validity = this.options.signatureValidity;
    const signatureBody = { timestamp, validity };
    const signature = createHmac('sha256', this.options.secretKey)
      .update(JSON.stringify(signatureBody))
      .digest('hex');

    return this.request(path, {
      query: { timestamp, validity },
      headers: {
        'firi-access-key': this.options.apiKey,
        'firi-user-clientid': this.options.clientId,
        'firi-user-signature': signature,
      },
    });
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path, normalizedBase(this.options.apiBase));
    for (const [key, value] of Object.entries(options.query || {})) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Firi request failed: GET ${url.pathname} ${response.status} ${body}`);
    }

    return response.json() as Promise<T>;
  }
}

type RequestOptions = {
  query?: Record<string, string>;
  headers?: Record<string, string>;
};

function normalizedBase(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}
