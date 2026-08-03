import { updateActualBalance, summarizeResult } from './actual.js';
import { loadConfig } from './config.js';
import { localDateString } from './date.js';
import { FiriClient } from './firi.js';
import { formatValuationNotes, valuePortfolio } from './valuation.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const date = localDateString(new Date(), config.timeZone);
  const importedId = `firi-balance-${date}`;

  const firi = new FiriClient(config.firi);
  const [balances, markets] = await Promise.all([firi.getBalances(), firi.getMarkets()]);
  const valuation = valuePortfolio(balances, markets);
  const notes = formatValuationNotes(valuation);

  const result = await updateActualBalance({
    actual: config.actual,
    date,
    importedId,
    targetBalance: valuation.totalActualAmount,
    notes,
    dryRun: config.dryRun,
  });

  console.log(JSON.stringify({
    message: 'Firi Actual sync complete',
    valuation: {
      totalNok: valuation.totalNok,
      holdings: valuation.holdings,
    },
    actual: summarizeResult(result),
    timeZone: config.timeZone,
  }, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ message: 'Firi Actual sync failed', error: message }, null, 2));
  process.exitCode = 1;
});
