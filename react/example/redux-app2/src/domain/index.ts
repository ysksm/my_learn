import { Account } from "./account";

export interface Domain {
    accounts: Account[];
    currentAccountId: string | null;
    currentAccount: Account | null;
    loading: boolean;
    error: string | null;
}