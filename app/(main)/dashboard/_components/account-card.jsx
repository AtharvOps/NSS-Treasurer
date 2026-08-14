"use client";

import { ArrowUpRight, ArrowDownRight, Building2, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/accounts";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault, _count } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.stopPropagation();

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default operations account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-md transition-all group relative border-blue-900/15 dark:border-blue-900/30 overflow-hidden bg-card">
        <Link href={`/account/${id}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-900 dark:text-blue-300" />
              <CardTitle className="text-sm font-bold text-blue-950 dark:text-white capitalize">
                {name}
              </CardTitle>
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5"
            >
              {isDefault && (
                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 text-[10px] py-0 px-1.5 font-medium">
                  Primary
                </Badge>
              )}
              <Switch
                checked={isDefault}
                onCheckedChange={() => updateDefaultFn(id)}
                disabled={updateDefaultLoading}
                aria-label="Set as default account"
              />
            </div>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-black text-blue-950 dark:text-blue-200 font-mono">
              ₹{parseFloat(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {type.charAt(0) + type.slice(1).toLowerCase()} Ledger • {_count?.transactions || 0} Vouchers
            </p>
          </CardContent>
          <CardFooter className="flex justify-between text-xs text-muted-foreground pt-1 border-t bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center text-emerald-600 font-medium">
              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
              Grants / Income
            </div>
            <div className="flex items-center text-rose-600 font-medium">
              <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
              Camp Expenses
            </div>
          </CardFooter>
        </Link>
      </Card>
    </motion.div>
  );
}