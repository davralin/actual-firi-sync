import type { FiriBalance, FiriMarket } from './firi.js';
import { addDecimal, decimalToActualAmount, formatDecimal, isZero, multiplyDecimal, parseDecimal } from './money.js';

export type HoldingValuation = {
  currency: string;
  balance: string;
  market?: string;
  price?: string;
  valueNok: string;
};

export type PortfolioValuation = {
  totalActualAmount: number;
  totalNok: string;
  holdings: HoldingValuation[];
};

export function valuePortfolio(balances: FiriBalance[], markets: FiriMarket[]): PortfolioValuation {
  const marketById = new Map(markets.map((market) => [market.id, market]));
  let total = 0n;
  const holdings: HoldingValuation[] = [];

  for (const balance of balances) {
    const amount = parseDecimal(balance.balance);
    if (isZero(amount)) {
      continue;
    }

    if (balance.currency === 'NOK') {
      total = addDecimal(total, amount);
      holdings.push({
        currency: balance.currency,
        balance: balance.balance,
        valueNok: formatDecimal(amount, 2),
      });
      continue;
    }

    const marketId = `${balance.currency}NOK`;
    const market = marketById.get(marketId);
    if (!market) {
      throw new Error(`No NOK market found for non-zero Firi balance: ${balance.currency}`);
    }

    const price = parseDecimal(market.last);
    const value = multiplyDecimal(amount, price);
    total = addDecimal(total, value);
    holdings.push({
      currency: balance.currency,
      balance: balance.balance,
      market: marketId,
      price: market.last,
      valueNok: formatDecimal(value, 2),
    });
  }

  return {
    totalActualAmount: decimalToActualAmount(total),
    totalNok: formatDecimal(total, 2),
    holdings,
  };
}

export function formatValuationNotes(valuation: PortfolioValuation): string {
  const holdings = valuation.holdings
    .map((holding) => {
      if (holding.market) {
        return `${holding.currency}: ${holding.balance} @ ${holding.price} ${holding.market} = ${holding.valueNok} NOK`;
      }
      return `${holding.currency}: ${holding.balance} = ${holding.valueNok} NOK`;
    })
    .join('\n');

  return `Firi valuation total: ${valuation.totalNok} NOK\n${holdings}`.trim();
}
