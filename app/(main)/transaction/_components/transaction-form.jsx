"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Loader2,
  Tag,
  CreditCard,
  ShieldCheck,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";
import {
  NSS_EVENTS,
  PAYMENT_METHODS,
  REIMBURSEMENT_STATUSES,
  parseNssMetadata,
  formatNssDescription,
} from "@/data/nss-events";

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // Initial metadata parsing for edit mode
  const initialMeta = initialData ? parseNssMetadata(initialData) : null;

  const [selectedEvent, setSelectedEvent] = useState(
    initialMeta?.eventName || "7-Day Annual Special Camp"
  );
  const [selectedPayment, setSelectedPayment] = useState(
    initialMeta?.paymentMethod || "UPI"
  );
  const [selectedStatus, setSelectedStatus] = useState(
    initialMeta?.reimbursementStatus || "Direct Expense"
  );
  const [receiptAttached, setReceiptAttached] = useState(
    initialMeta?.hasReceipt || false
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialMeta?.cleanDescription || initialData.description || "",
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = (data) => {
    // Non-destructively format description with NSS tags
    const formattedDesc = formatNssDescription({
      description: data.description || "",
      eventName: selectedEvent,
      paymentMethod: selectedPayment,
      reimbursementStatus: selectedStatus,
      hasReceipt: receiptAttached,
    });

    const formData = {
      ...data,
      description: formattedDesc,
      amount: parseFloat(data.amount),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      setReceiptAttached(true);
      toast.success("Receipt scanned and attached to transaction voucher");
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "NSS Voucher updated successfully"
          : "NSS Voucher created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode, reset, router]);

  const type = useWatch({ control, name: "type" });
  const isRecurring = useWatch({ control, name: "isRecurring" });
  const date = useWatch({ control, name: "date" });

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Receipt Scanner - Only show in create mode */}
      {!editMode && (
        <div className="rounded-2xl border border-blue-900/20 dark:border-blue-700/40 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-blue-950 dark:text-blue-200 uppercase tracking-wider">
              Gemini AI Receipt OCR
            </span>
          </div>
          <ReceiptScanner onScanComplete={handleScanComplete} />
        </div>
      )}

      {/* Type Selector (Segmented Button for Clean Color Contrast) */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue("type", "EXPENSE")}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
              type === "EXPENSE"
                ? "bg-rose-950 text-white border-rose-800 shadow-sm ring-2 ring-rose-500/30"
                : "bg-card text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
            }`}
          >
            <ArrowDownRight className="h-4 w-4 text-rose-400" />
            <span>Expense (Camp/Activity Cost)</span>
          </button>

          <button
            type="button"
            onClick={() => setValue("type", "INCOME")}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
              type === "INCOME"
                ? "bg-emerald-950 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-500/30"
                : "bg-card text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            <span>Income (Grant / Donation)</span>
          </button>
        </div>
        {errors.type && (
          <p className="text-xs text-rose-500 mt-1">{errors.type.message}</p>
        )}
      </div>

      {/* NSS Event & Camp Tagging */}
      <div className="space-y-2 p-4.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-900/20 dark:border-blue-800/40">
        <label className="text-xs font-bold uppercase tracking-wider text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
          <span>NSS Event / Activity Tag</span>
        </label>
        <Select
          value={selectedEvent}
          onValueChange={setSelectedEvent}
        >
          <SelectTrigger className="bg-white dark:bg-slate-900 border-blue-900/20 dark:border-blue-700/40 h-10 text-sm">
            <SelectValue placeholder="Select NSS Event" />
          </SelectTrigger>
          <SelectContent>
            {NSS_EVENTS.map((evt) => (
              <SelectItem key={evt.id} value={evt.name}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: evt.color }}
                  />
                  <span className="font-medium">{evt.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          Tags this voucher for official NSS event reporting &amp; SPPU camp audit statements.
        </p>
      </div>

      {/* Amount and Account */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Amount (INR ₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm font-bold text-muted-foreground">
              ₹
            </span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="pl-8 font-mono font-bold text-base h-10 bg-white dark:bg-slate-900"
              {...register("amount")}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-rose-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Unit Account Ledger
          </label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger className="h-10 bg-white dark:bg-slate-900">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (₹{parseFloat(account.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-xs outline-none hover:bg-accent"
                >
                  + Add New Unit Ledger
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-xs text-rose-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      {/* Payment Method & Reimbursement Status */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-blue-600" />
            <span>Payment Method</span>
          </label>
          <Select
            value={selectedPayment}
            onValueChange={setSelectedPayment}
          >
            <SelectTrigger className="h-10 bg-white dark:bg-slate-900">
              <SelectValue placeholder="Payment Mode" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((pm) => (
                <SelectItem key={pm.id} value={pm.id}>
                  {pm.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Reimbursement Status</span>
          </label>
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="h-10 bg-white dark:bg-slate-900">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {REIMBURSEMENT_STATUSES.map((st) => (
                <SelectItem key={st.id} value={st.id}>
                  {st.label} ({st.description})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Expense / Income Category
        </label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger className="h-10 bg-white dark:bg-slate-900">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-rose-500">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Voucher Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-10 pl-3 text-left font-normal bg-white dark:bg-slate-900 justify-between",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="h-4 w-4 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => setValue("date", d)}
              disabled={(d) =>
                d > new Date() || d < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-xs text-rose-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description & Purpose */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Description / Voucher Purpose
        </label>
        <Input
          placeholder="e.g., Snacks for 60 volunteers during village cleanliness rally"
          className="h-10 bg-white dark:bg-slate-900"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-rose-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="space-y-0.5">
          <label className="text-sm font-semibold">Recurring Transaction</label>
          <div className="text-xs text-muted-foreground">
            Set up a recurring schedule for regular weekly/monthly student allowances
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Recurring Interval
          </label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger className="h-10 bg-white dark:bg-slate-900">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-xs text-rose-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-3">
        <Button
          type="button"
          variant="outline"
          className="w-1/2 h-11 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-1/2 h-11 bg-blue-950 hover:bg-blue-900 dark:bg-blue-800 dark:hover:bg-blue-700 text-white font-bold shadow-md"
          disabled={transactionLoading}
        >
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating Voucher..." : "Recording Voucher..."}
            </>
          ) : editMode ? (
            "Update NSS Voucher"
          ) : (
            "Create NSS Voucher"
          )}
        </Button>
      </div>
    </form>
  );
}