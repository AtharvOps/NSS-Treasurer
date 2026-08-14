import { Suspense } from "react";
import { getUserAccounts, getDashboardData } from "@/actions/dashboard";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { AccountCard } from "./_components/account-card";
import { BudgetProgress } from "./_components/budget-progress";
import { getCurrentBudget } from "@/actions/budget";
import { DashboardOverview } from "./_components/transaction-overview";
import { NssUnitBadge } from "@/components/nss-unit-badge";
import { parseNssMetadata } from "@/data/nss-events";
import { Skeleton } from "@/components/ui/skeleton";

async function DashboardPage() {
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  // Find the default account
  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  const allTransactions = transactions || [];

  // Calculate high-level NSS Financial KPI metrics
  const totalIncome = allTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = allTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalBalance = (accounts || []).reduce(
    (sum, a) => sum + Number(a.balance || 0),
    0
  );

  const pendingReimbursements = allTransactions.filter((t) => {
    const meta = parseNssMetadata(t);
    return meta.reimbursementStatus === "Pending Approval";
  });

  return (
    <div className="space-y-8 px-2 sm:px-4">
      {/* NSS Unit Branding Header */}
      <NssUnitBadge />

      {/* NSS Financial KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Grants / Income */}
        <Card className="border-blue-900/15 bg-gradient-to-br from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Grants & Income
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                <span>University grants & donations</span>
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ArrowUpRight className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Approved Expenses */}
        <Card className="border-blue-900/15 bg-gradient-to-br from-white to-rose-50/40 dark:from-slate-900 dark:to-rose-950/20 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Camp & Unit Expenses
              </span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                ₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-rose-500" />
                <span>{allTransactions.filter((t) => t.type === "EXPENSE").length} verified vouchers</span>
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <ArrowDownRight className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Available Unit Balance */}
        <Card className="border-blue-900/15 bg-gradient-to-br from-white to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Available Unit Balance
              </span>
              <div className="text-2xl font-black text-blue-950 dark:text-blue-200 font-mono">
                ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-blue-600" />
                <span>Across {accounts?.length || 0} unit ledgers</span>
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-900 dark:text-blue-300 shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Reimbursements Queue */}
        <Card className="border-blue-900/15 bg-gradient-to-br from-white to-amber-50/40 dark:from-slate-900 dark:to-amber-950/20 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reimbursement Queue
              </span>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
                {pendingReimbursements.length} <span className="text-sm font-normal text-muted-foreground">vouchers</span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                <span>Awaiting PO approval</span>
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
              <Receipt className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress Component */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      {/* Interactive Overview with Date Switcher & Category Progress */}
      <DashboardOverview
        accounts={accounts || []}
        transactions={allTransactions}
      />

      {/* Account Ledgers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-blue-950 dark:text-white">
              NSS Unit Bank & Cash Ledgers
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage separate operational accounts, camp cash in hand, and grants
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="hover:shadow-md transition-all cursor-pointer border-dashed border-2 border-blue-900/20 hover:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full py-8">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-900 dark:text-blue-300 mb-2">
                  <Plus className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-blue-950 dark:text-white">
                  Add New Unit Account
                </p>
                <p className="text-xs text-muted-foreground">
                  (e.g., Camp Cash In Hand, University Grant Ledger)
                </p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>

          {accounts?.length > 0 &&
            accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
