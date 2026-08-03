# actual-firi-sync

Containerized one-shot job that syncs Firi wallet value into one Actual Budget off-budget account.

The job fetches Firi balances, values non-NOK holdings through `${currency}NOK` markets using Firi `last` prices, and writes one deterministic daily Actual adjustment transaction.

## Actual Model

- Account: one off-budget account, default `Firi`.
- Transaction imported ID: `firi-balance-YYYY-MM-DD`.
- Payee: `Firi valuation`.
- Amount: daily adjustment needed to make Actual match the current Firi NOK valuation.
- State: no database; Actual imported IDs provide idempotency.

If the daily transaction already exists, the job updates that transaction instead of creating a duplicate. The adjustment calculation removes the existing same-day adjustment from the current Actual balance before calculating the replacement amount, so reruns during the same day track Firi price movement.

## Valuation

- NOK balances are included directly.
- Non-NOK balances are valued through Firi `${currency}NOK` markets.
- The current implementation uses Firi market `last` prices.
- Zero balances are ignored.
- A non-zero non-NOK balance without a NOK market fails the run instead of silently dropping value.

The app stores no durable state outside Actual Budget and the local Actual API cache directory.

## Configuration

Required environment variables:

```env
ACTUAL_SERVER_URL=https://actual.example.com
ACTUAL_PASSWORD=example-actual-password
ACTUAL_SYNC_ID=00000000-0000-0000-0000-000000000000

FIRI_API_KEY=example-api-key
FIRI_CLIENT_ID=example-client-id
FIRI_SECRET_KEY=example-secret-key
```

Optional environment variables:

```env
ACTUAL_DATA_DIR=/app/cache
ACTUAL_ACCOUNT_NAME=Firi
ACTUAL_CREATE_ACCOUNT=false
FIRI_API_BASE=https://api.firi.com
FIRI_SIGNATURE_VALIDITY=2000
DRY_RUN=false
TZ=UTC
```

`DRY_RUN=false` is the default. Set `DRY_RUN=true` to preview the planned Actual change without writing it.

`ACTUAL_CREATE_ACCOUNT=false` is the default. If the account is missing, the job fails unless `ACTUAL_CREATE_ACCOUNT=true` is set.

`TZ` controls the calendar day used in `firi-balance-YYYY-MM-DD` and defaults to `UTC`.

## Development

```sh
npm ci
npm test
npm run typecheck
docker build -f Containerfile -t actual-firi-sync:local .
```

Run the container with an env file:

```sh
docker run --rm --env-file .env actual-firi-sync:local
```

## Container

The image is a batch/CronJob image and intentionally declares `HEALTHCHECK NONE`.
