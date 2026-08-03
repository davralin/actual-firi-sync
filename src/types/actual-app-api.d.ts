declare module '@actual-app/api' {
  export type Account = {
    id: string;
    name: string;
    offbudget?: boolean;
    closed?: boolean;
    type?: string;
  };

  export type Transaction = {
    id: string;
    account?: string;
    date: string;
    amount: number;
    imported_id?: string;
    notes?: string;
  };

  export function init(options: {
    dataDir: string;
    serverURL: string;
    password: string;
  }): Promise<void>;
  export function shutdown(): Promise<void>;
  export function downloadBudget(syncId: string, options?: { password?: string }): Promise<void>;
  export function getAccounts(): Promise<Account[]>;
  export function createAccount(account: Record<string, unknown>, initialBalance?: number): Promise<string>;
  export function getAccountBalance(accountId: string, cutoff?: string): Promise<number>;
  export function getTransactions(accountId: string, startDate: string, endDate: string): Promise<Transaction[]>;
  export function importTransactions(
    accountId: string,
    transactions: Array<Record<string, unknown>>,
    options?: { defaultCleared?: boolean; dryRun?: boolean },
  ): Promise<unknown>;
  export function updateTransaction(id: string, fields: Record<string, unknown>): Promise<void>;
  export function sync(): Promise<void>;
}
