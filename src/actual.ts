import * as api from '@actual-app/api';
import { actualAmountToNok } from './money.js';

const BALANCE_START_DATE = '1900-01-01';

export type ActualOptions = {
  serverUrl: string;
  password: string;
  syncId: string;
  dataDir: string;
  accountName: string;
  createAccount: boolean;
};

export type SyncPlan = {
  accountId?: string;
  accountName: string;
  accountExists: boolean;
  currentBalance: number;
  existingAdjustment: number;
  targetBalance: number;
  adjustment: number;
  importedId: string;
  date: string;
  notes: string;
};

export type SyncResult = SyncPlan & {
  action: 'create-account-and-transaction' | 'create-transaction' | 'update-transaction' | 'noop';
  dryRun: boolean;
};

export async function updateActualBalance(options: {
  actual: ActualOptions;
  date: string;
  importedId: string;
  targetBalance: number;
  notes: string;
  dryRun: boolean;
}): Promise<SyncResult> {
  await api.init({
    dataDir: options.actual.dataDir,
    serverURL: options.actual.serverUrl,
    password: options.actual.password,
  });

  try {
    await api.downloadBudget(options.actual.syncId);
    const accounts = await api.getAccounts();
    let account = accounts.find((candidate) => candidate.name === options.actual.accountName && !candidate.closed);

    if (!account) {
      const plan = buildPlan({
        accountName: options.actual.accountName,
        accountExists: false,
        currentBalance: 0,
        existingAdjustment: 0,
        targetBalance: options.targetBalance,
        importedId: options.importedId,
        date: options.date,
        notes: options.notes,
      });

      if (options.dryRun) {
        return { ...plan, action: 'create-account-and-transaction', dryRun: true };
      }
      if (!options.actual.createAccount) {
        throw new Error(`Actual account "${options.actual.accountName}" does not exist. Set ACTUAL_CREATE_ACCOUNT=true to create it.`);
      }
      const accountId = await api.createAccount({ name: options.actual.accountName, offbudget: true }, 0);
      account = { id: accountId, name: options.actual.accountName, offbudget: true };
    }

    if (!account.offbudget) {
      throw new Error(`Actual account "${options.actual.accountName}" exists but is not off-budget.`);
    }

    const transactions = await api.getTransactions(account.id, BALANCE_START_DATE, options.date);
    const currentBalance = sumTransactionAmounts(transactions);
    const existing = transactions.find((transaction) => transaction.imported_id === options.importedId);
    const existingAdjustment = existing?.amount || 0;
    const plan = buildPlan({
      accountId: account.id,
      accountName: account.name,
      accountExists: true,
      currentBalance,
      existingAdjustment,
      targetBalance: options.targetBalance,
      importedId: options.importedId,
      date: options.date,
      notes: options.notes,
    });

    if (options.dryRun) {
      return { ...plan, action: existing ? 'update-transaction' : plan.adjustment === 0 ? 'noop' : 'create-transaction', dryRun: true };
    }

    if (existing) {
      await api.updateTransaction(existing.id, { amount: plan.adjustment, notes: options.notes });
      await api.sync();
      return { ...plan, action: 'update-transaction', dryRun: false };
    }

    if (plan.adjustment === 0) {
      return { ...plan, action: 'noop', dryRun: false };
    }

    await api.importTransactions(
      account.id,
      [
        {
          date: options.date,
          amount: plan.adjustment,
          payee_name: 'Firi valuation',
          notes: options.notes,
          imported_id: options.importedId,
          cleared: true,
        },
      ],
      { defaultCleared: true, dryRun: false },
    );
    await api.sync();
    return { ...plan, action: 'create-transaction', dryRun: false };
  } finally {
    await api.shutdown();
  }
}

export function calculateAdjustment(currentBalance: number, existingAdjustment: number, targetBalance: number): number {
  return targetBalance - (currentBalance - existingAdjustment);
}

export function sumTransactionAmounts(transactions: Array<{ amount: number }>): number {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

function buildPlan(options: {
  accountId?: string;
  accountName: string;
  accountExists: boolean;
  currentBalance: number;
  existingAdjustment: number;
  targetBalance: number;
  importedId: string;
  date: string;
  notes: string;
}): SyncPlan {
  return {
    ...options,
    adjustment: calculateAdjustment(options.currentBalance, options.existingAdjustment, options.targetBalance),
  };
}

export function summarizeResult(result: SyncResult): Record<string, unknown> {
  return {
    dryRun: result.dryRun,
    action: result.action,
    accountName: result.accountName,
    accountExists: result.accountExists,
    date: result.date,
    importedId: result.importedId,
    currentBalanceNok: actualAmountToNok(result.currentBalance),
    existingAdjustmentNok: actualAmountToNok(result.existingAdjustment),
    targetBalanceNok: actualAmountToNok(result.targetBalance),
    adjustmentNok: actualAmountToNok(result.adjustment),
  };
}
