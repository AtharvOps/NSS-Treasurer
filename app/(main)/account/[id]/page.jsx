import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { Badge } from "@/components/ui/badge";
import { Building2, ShieldCheck } from "lucide-react";

export default async function AccountPage({ params: rawParams }) {
  const params = await rawParams;
  const accountData = await getAccountWithTransactions(params.id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-2 sm:px-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-blue-900/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-200 text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              NSS Unit Ledger
            </Badge>
            {account.isDefault && (
              <Badge className="bg-amber-500/20 text-amber-700 border-amber-300 text-xs">
                Primary Operations Account
              </Badge>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account • PVG&apos;s COET NSS Cell
          </p>
        </div>

        <div className="text-left sm:text-right bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-900/10">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Available Balance
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-950 dark:text-blue-200 font-mono mt-0.5">
            ₹{parseFloat(account.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {account._count.transactions} Registered Vouchers
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={
          <div className="h-72 w-full rounded-xl bg-card border p-4 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-56 w-full" />
          </div>
        }
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transactions Table */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="rounded-xl border p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        }
      >
        <TransactionTable
          transactions={transactions}
          accountName={account.name}
        />
      </Suspense>
    </div>
  );
}