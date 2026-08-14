"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, ShieldAlert, Sparkles, Wallet, AlertTriangle } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses = 0 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const budgetAmount = initialBudget?.amount || 0;
  const percentUsed = budgetAmount > 0 ? (currentExpenses / budgetAmount) * 100 : 0;
  const remainingBudget = Math.max(budgetAmount - currentExpenses, 0);

  // Below 80% is GREEN, 80% and above is RED
  const isRed = percentUsed >= 80;
  const barColor = isRed ? "#dc2626" : "#16a34a"; // Red above 80%, Green below 80%

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const result = await updateBudgetFn(amount);
    if (result?.success) {
      setIsEditing(false);
      toast.success("NSS Unit Budget updated successfully");
    }
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  const getStatusBadge = () => {
    if (!initialBudget) return null;
    if (percentUsed >= 100) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 text-[10px] gap-1 font-semibold">
          <AlertTriangle className="h-3 w-3 text-red-600" /> Budget Exceeded
        </Badge>
      );
    }
    if (isRed) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 text-[10px] gap-1 font-semibold">
          <ShieldAlert className="h-3 w-3 text-red-600" /> 80% Limit Warning
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 text-[10px] gap-1 font-semibold">
        <Sparkles className="h-3 w-3 text-emerald-600" /> Healthy Balance
      </Badge>
    );
  };

  return (
    <Card className={`border shadow-sm overflow-hidden ${isRed ? "border-red-400/40 bg-red-50/10 dark:bg-red-950/20" : "border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/20"}`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-3 border-b border-slate-200/40 dark:border-slate-800">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`h-7 w-7 rounded-lg ${isRed ? "bg-red-600" : "bg-emerald-600"} text-white flex items-center justify-center shadow-xs`}>
              <Wallet className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-950 dark:text-white">
              NSS Budget Allocation &amp; Grant Utilization
            </CardTitle>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-700 dark:text-slate-300">₹</span>
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-36 pl-6 h-8 text-xs font-mono font-bold"
                    placeholder="Enter budget"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                  className="h-8 w-8 text-emerald-700 hover:bg-emerald-100"
                  title="Save"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="h-8 w-8 text-red-600 hover:bg-red-50"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {initialBudget ? (
                    <span>
                      <strong className={`font-mono text-sm font-bold ${isRed ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                        ₹{currentExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-slate-900 dark:text-white font-mono font-bold">
                        ₹{budgetAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </strong>{" "}
                      grant utilized (
                      <span className={`font-bold font-mono ${isRed ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                        ₹{remainingBudget.toLocaleString("en-IN", { minimumFractionDigits: 2 })} available
                      </span>
                      )
                    </span>
                  ) : (
                    "No monthly expenditure cap set for this unit ledger"
                  )}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-7 w-7 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit Budget"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {initialBudget ? (
          <div className="space-y-2">
            <div className="relative">
              <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{
                    width: `${Math.min(percentUsed, 100)}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium text-emerald-700 dark:text-emerald-400">0% (Safe)</span>
              <span
                className="font-mono font-bold text-xs sm:text-sm"
                style={{ color: barColor }}
              >
                {percentUsed.toFixed(1)}% {isRed ? "Critical (≥80%)" : "Utilized (<80%)"}
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">100% (Cap)</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground py-1 flex items-center gap-2">
            <span>Click the pencil icon above to configure your monthly NSS budget target.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}