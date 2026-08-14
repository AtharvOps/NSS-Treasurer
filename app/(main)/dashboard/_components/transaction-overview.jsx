"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Filter,
  Tag,
  Receipt,
  Tent,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { parseNssMetadata, NSS_EVENTS } from "@/data/nss-events";
import { categoryColors } from "@/data/categories";

const COLORS = [
  "#1e3a8a", // navy
  "#be123c", // crimson
  "#d97706", // saffron/amber
  "#059669", // emerald
  "#7c3aed", // violet
  "#0284c7", // sky
  "#db2777", // pink
  "#64748b", // slate
];

export function DashboardOverview({ accounts = [], transactions = [] }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || "ALL"
  );
  const [dateRange, setDateRange] = useState("THIS_MONTH");
  const [selectedEventTag, setSelectedEventTag] = useState("ALL");

  // Enriched transactions with NSS metadata
  const enrichedTransactions = useMemo(() => {
    return transactions.map((t) => ({
      ...t,
      meta: parseNssMetadata(t),
      dateObj: new Date(t.date),
    }));
  }, [transactions]);

  // Filter transactions based on account, date range, and NSS event
  const filteredTransactions = useMemo(() => {
    let result = enrichedTransactions;

    // Filter by account
    if (selectedAccountId && selectedAccountId !== "ALL") {
      result = result.filter((t) => t.accountId === selectedAccountId);
    }

    // Filter by NSS event
    if (selectedEventTag && selectedEventTag !== "ALL") {
      result = result.filter(
        (t) =>
          t.meta.eventName.toLowerCase() === selectedEventTag.toLowerCase() ||
          t.meta.eventObj.name.toLowerCase() === selectedEventTag.toLowerCase()
      );
    }

    // Filter by date range
    const now = new Date();
    if (dateRange === "THIS_MONTH") {
      result = result.filter(
        (t) =>
          t.dateObj.getMonth() === now.getMonth() &&
          t.dateObj.getFullYear() === now.getFullYear()
      );
    } else if (dateRange === "CAMP_DURATION") {
      // Filter camp-tagged transactions or transactions in current 7-day period
      result = result.filter(
        (t) =>
          t.meta.eventName.toLowerCase().includes("camp") ||
          t.category.toLowerCase().includes("camp")
      );
    } else if (dateRange === "ACADEMIC_YEAR") {
      // Academic year 2025-2026
      result = result.filter(
        (t) => t.dateObj.getFullYear() >= 2025 && t.dateObj.getFullYear() <= 2026
      );
    }

    return result;
  }, [enrichedTransactions, selectedAccountId, selectedEventTag, dateRange]);

  // Recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => b.dateObj - a.dateObj)
      .slice(0, 5);
  }, [filteredTransactions]);

  // Expenses calculations
  const expenseTransactions = useMemo(() => {
    return filteredTransactions.filter((t) => t.type === "EXPENSE");
  }, [filteredTransactions]);

  const totalExpenseAmount = useMemo(() => {
    return expenseTransactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  }, [expenseTransactions]);

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    return expenseTransactions.reduce((acc, t) => {
      const category = t.category || "Miscellaneous";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Number(t.amount || 0);
      return acc;
    }, {});
  }, [expenseTransactions]);

  // Group expenses by NSS Event
  const expensesByEvent = useMemo(() => {
    return expenseTransactions.reduce((acc, t) => {
      const evt = t.meta.eventObj.shortName || "Regular";
      if (!acc[evt]) {
        acc[evt] = 0;
      }
      acc[evt] += Number(t.amount || 0);
      return acc;
    }, {});
  }, [expenseTransactions]);

  // Format data for pie chart
  const pieChartData = useMemo(() => {
    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));
  }, [expensesByCategory]);

  // Category progress cards data with budget baselines
  const categoryCardsData = useMemo(() => {
    const entries = Object.entries(expensesByCategory);
    if (entries.length === 0) return [];

    return entries
      .map(([category, amount]) => {
        // Benchmark estimate for NSS categories
        const benchmark = Math.max(amount * 1.25, 5000);
        const percent = totalExpenseAmount > 0 ? (amount / totalExpenseAmount) * 100 : 0;
        return {
          category,
          amount,
          percent,
          color: categoryColors[category] || "#1e3a8a",
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [expensesByCategory, totalExpenseAmount]);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar: Date Range Tabs & Account / Event Selectors */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-xl border border-blue-900/15 dark:border-blue-900/30 shadow-2xs">
        {/* Date Range Tabs */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-900 dark:text-blue-300 hidden sm:block" />
          <Tabs value={dateRange} onValueChange={setDateRange} className="w-full sm:w-auto">
            <TabsList className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-9 p-1">
              <TabsTrigger value="THIS_MONTH" className="text-xs">
                This Month
              </TabsTrigger>
              <TabsTrigger value="CAMP_DURATION" className="text-xs">
                Camp Duration
              </TabsTrigger>
              <TabsTrigger value="ACADEMIC_YEAR" className="text-xs">
                AY 2025–26
              </TabsTrigger>
              <TabsTrigger value="ALL_TIME" className="text-xs">
                All Time
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Selectors for Account & NSS Event Tag */}
        <div className="flex items-center gap-2.5">
          {/* NSS Event Filter */}
          <div className="w-40">
            <Select value={selectedEventTag} onValueChange={setSelectedEventTag}>
              <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-800">
                <SelectValue placeholder="Filter by Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All NSS Events</SelectItem>
                {NSS_EVENTS.map((e) => (
                  <SelectItem key={e.id} value={e.name}>
                    {e.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Selector */}
          {accounts.length > 0 && (
            <div className="w-40">
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="h-9 text-xs bg-white dark:bg-slate-800">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Unit Ledgers</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Recent Transactions & Expense Breakdown Pie Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions Card */}
        <Card className="border-blue-900/15 shadow-xs flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-blue-950 dark:text-white flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-900" />
                <span>Recent NSS Transactions</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Latest vouchers recorded in the ledger
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-900 border-blue-200">
              {filteredTransactions.length} Total
            </Badge>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No transactions in selected period</p>
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors border border-slate-100 dark:border-slate-800"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-none text-foreground">
                          {transaction.meta.cleanDescription}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(transaction.dateObj, "dd MMM yyyy")}</span>
                        <span>•</span>
                        <span className="capitalize">{transaction.category}</span>
                        <span>•</span>
                        <span className="text-blue-900 dark:text-blue-300 font-medium">
                          {transaction.meta.eventObj.shortName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex items-center font-mono font-bold text-sm",
                          transaction.type === "EXPENSE"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {transaction.type === "EXPENSE" ? (
                          <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
                        )}
                        ₹{Number(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown Card */}
        <Card className="border-blue-900/15 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-blue-950 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-900" />
                <span>Expenditure Distribution</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Category allocation for active filter (₹{totalExpenseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })})
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 pb-4">
            {pieChartData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No expense records found</p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={categoryColors[entry.name] || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                        "Spent",
                      ]}
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      formatter={(val) => (
                        <span className="text-xs text-foreground font-medium">{val}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Summary Progress Cards */}
      {categoryCardsData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Tent className="h-4 w-4 text-amber-600" />
              <span>Top NSS Expense Heads & Budget Velocity</span>
            </h3>
            <span className="text-xs text-muted-foreground">
              Proportion of total approved funds
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryCardsData.map((item, index) => (
              <Card key={index} className="border-blue-900/10 shadow-2xs hover:shadow-xs transition-shadow">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-950 dark:text-blue-300">
                      ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(item.percent, 100)}
                    className="h-2 bg-slate-100 dark:bg-slate-800"
                    style={{
                      "--progress-color": item.color,
                    }}
                  />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Share of total:</span>
                    <span className="font-semibold text-foreground">
                      {item.percent.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}