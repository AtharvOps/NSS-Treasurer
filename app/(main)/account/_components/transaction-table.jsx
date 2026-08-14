"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Download,
  FileText,
  Receipt,
  QrCode,
  Banknote,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { categoryColors } from "@/data/categories";
import { bulkDeleteTransactions } from "@/actions/accounts";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import {
  parseNssMetadata,
  NSS_EVENTS,
  PAYMENT_METHODS,
  REIMBURSEMENT_STATUSES,
} from "@/data/nss-events";
import { AuditReportModal } from "@/components/audit-report-modal";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function TransactionTable({ transactions = [], accountName = "NSS Account" }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [reimbursementFilter, setReimbursementFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Parse all transactions with NSS metadata
  const enrichedTransactions = useMemo(() => {
    return transactions.map((t) => ({
      ...t,
      meta: parseNssMetadata(t),
    }));
  }, [transactions]);

  // Memoized filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...enrichedTransactions];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.meta.cleanDescription.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.category?.toLowerCase().includes(searchLower) ||
          t.meta.eventName?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    // NSS Event filter
    if (eventFilter) {
      result = result.filter(
        (t) =>
          t.meta.eventName.toLowerCase() === eventFilter.toLowerCase() ||
          t.meta.eventObj.name.toLowerCase() === eventFilter.toLowerCase()
      );
    }

    // Reimbursement status filter
    if (reimbursementFilter) {
      result = result.filter(
        (t) =>
          t.meta.reimbursementStatus.toLowerCase() ===
          reimbursementFilter.toLowerCase()
      );
    }

    // Recurring filter
    if (recurringFilter) {
      result = result.filter((t) => {
        if (recurringFilter === "recurring") return t.isRecurring;
        return !t.isRecurring;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "event":
          comparison = a.meta.eventName.localeCompare(b.meta.eventName);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    enrichedTransactions,
    searchTerm,
    typeFilter,
    eventFilter,
    reimbursementFilter,
    recurringFilter,
    sortConfig,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  };

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    )
      return;

    const res = await deleteFn(selectedIds);
    if (res?.success || res) {
      toast.success("Transactions deleted successfully");
      setSelectedIds([]);
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    const res = await deleteFn([id]);
    if (res?.success || res) {
      toast.success("Transaction deleted successfully");
      setSelectedIds((current) => current.filter((item) => item !== id));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setEventFilter("");
    setReimbursementFilter("");
    setRecurringFilter("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  // Export to CSV Feature
  const handleExportCsv = () => {
    if (filteredAndSortedTransactions.length === 0) {
      toast.error("No transactions available to export");
      return;
    }

    const headers = [
      "S.No",
      "Date",
      "Description",
      "NSS Event / Camp",
      "Category",
      "Type",
      "Amount (INR)",
      "Payment Method",
      "Reimbursement Status",
      "Receipt Voucher Attached",
      "Recurring",
    ];

    const rows = filteredAndSortedTransactions.map((t, index) => [
      index + 1,
      format(new Date(t.date), "yyyy-MM-dd"),
      `"${(t.meta.cleanDescription || "").replace(/"/g, '""')}"`,
      `"${(t.meta.eventName || "").replace(/"/g, '""')}"`,
      `"${t.category || ""}"`,
      t.type,
      Number(t.amount).toFixed(2),
      `"${t.meta.paymentMethod || "UPI"}"`,
      `"${t.meta.reimbursementStatus || "Direct Expense"}"`,
      t.meta.hasReceipt ? "Yes" : "No",
      t.isRecurring ? "Yes" : "No",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `NSS_Treasurer_Statement_${format(new Date(), "yyyyMMdd_HHmm")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("NSS Financial Statement exported to CSV successfully");
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case "Cash":
        return <Banknote className="h-3 w-3 text-amber-600" />;
      case "Bank Transfer":
        return <Building2 className="h-3 w-3 text-blue-600" />;
      case "Cheque":
        return <FileSpreadsheet className="h-3 w-3 text-purple-600" />;
      default:
        return <QrCode className="h-3 w-3 text-emerald-600" />;
    }
  };

  const getReimbursementBadge = (status) => {
    switch (status) {
      case "Reimbursed":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] gap-1 hover:bg-emerald-200">
            <CheckCircle2 className="h-2.5 w-2.5" /> Reimbursed
          </Badge>
        );
      case "Pending Approval":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] gap-1 hover:bg-amber-200">
            <AlertCircle className="h-2.5 w-2.5" /> Pending Approval
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            Direct Expense
          </Badge>
        );
    }
  };

  const hasActiveFilters = Boolean(
    searchTerm || typeFilter || eventFilter || reimbursementFilter || recurringFilter
  );

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#1e3a8a" />
      )}

      {/* Top Controls: Search, Filters & Action Buttons */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description, event, camp, or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-white dark:bg-slate-900 border-blue-900/20"
            />
          </div>

          {/* Export & Audit Report Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="gap-1.5 border-blue-900/30 text-blue-900 dark:text-blue-200 hover:bg-blue-50"
              title="Download formatted CSV statement"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>

            <AuditReportModal
              transactions={transactions}
              accountName={accountName}
              triggerButton={
                <Button
                  size="sm"
                  className="gap-1.5 bg-blue-950 hover:bg-blue-900 text-white shadow-xs"
                >
                  <FileText className="h-4 w-4" />
                  <span>Generate Audit Report</span>
                </Button>
              }
            />
          </div>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="flex flex-wrap gap-2 items-center bg-slate-50/70 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
          {/* NSS Event Filter */}
          <div className="w-44">
            <Select
              value={eventFilter}
              onValueChange={(val) => {
                setEventFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800">
                <SelectValue placeholder="All NSS Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_EVENTS" onClick={() => setEventFilter("")}>
                  All Events & Camps
                </SelectItem>
                {NSS_EVENTS.map((e) => (
                  <SelectItem key={e.id} value={e.name}>
                    {e.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="w-28">
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reimbursement Filter */}
          <div className="w-36">
            <Select
              value={reimbursementFilter}
              onValueChange={(value) => {
                setReimbursementFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {REIMBURSEMENT_STATUSES.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Filter */}
          <div className="w-32">
            <Select
              value={recurringFilter}
              onValueChange={(value) => {
                setRecurringFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800">
                <SelectValue placeholder="Recurring" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Recurring Only</SelectItem>
                <SelectItem value="non-recurring">One-time Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Delete Action */}
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="h-8 text-xs gap-1.5"
            >
              <Trash className="h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </Button>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}

          <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
            Found <strong>{filteredAndSortedTransactions.length}</strong> vouchers
          </div>
        </div>
      </div>

      {/* Transactions Table with Framer Motion */}
      <div className="rounded-xl border border-blue-900/15 dark:border-blue-900/30 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/60">
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    selectedIds.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold text-xs text-blue-950 dark:text-blue-200"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-xs text-blue-950 dark:text-blue-200">
                Description & Purpose
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold text-xs text-blue-950 dark:text-blue-200"
                onClick={() => handleSort("event")}
              >
                <div className="flex items-center">
                  NSS Event
                  {sortConfig.field === "event" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold text-xs text-blue-950 dark:text-blue-200"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-xs text-blue-950 dark:text-blue-200 text-center">
                Mode & Proof
              </TableHead>
              <TableHead className="font-semibold text-xs text-blue-950 dark:text-blue-200 text-center">
                Reimbursement
              </TableHead>
              <TableHead
                className="cursor-pointer text-right font-semibold text-xs text-blue-950 dark:text-blue-200"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-10 text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">No NSS transactions found</p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search criteria or add a new transaction
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction, idx) => (
                <TableRow
                  key={transaction.id}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={() => handleSelect(transaction.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                    {format(new Date(transaction.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-foreground">
                        {transaction.meta.cleanDescription}
                      </span>
                      {transaction.isRecurring && (
                        <span className="text-[10px] text-purple-600 flex items-center gap-0.5 mt-0.5">
                          <RefreshCw className="h-2.5 w-2.5" />
                          Recurring ({RECURRING_INTERVALS[transaction.recurringInterval] || "Active"})
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-medium ${transaction.meta.eventObj.bgColor}`}
                    >
                      {transaction.meta.eventObj.shortName}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    <span
                      style={{
                        background: categoryColors[transaction.category] || "#64748b",
                      }}
                      className="px-2 py-0.5 rounded text-white text-xs font-medium shadow-2xs inline-block"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className="text-[10px] gap-1 px-2 py-0.5 font-normal bg-slate-100 dark:bg-slate-800"
                        title={`Paid via ${transaction.meta.paymentMethod}`}
                      >
                        {getPaymentIcon(transaction.meta.paymentMethod)}
                        <span>{transaction.meta.paymentMethod}</span>
                      </Badge>
                      {transaction.meta.hasReceipt ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <Receipt className="h-3 w-3" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Physical/Digital voucher attached</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                                <Receipt className="h-3 w-3 opacity-40" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">No receipt attached</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getReimbursementBadge(transaction.meta.reimbursementStatus)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono font-semibold text-sm",
                      transaction.type === "EXPENSE"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}₹
                    {Number(transaction.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                        >
                          Edit Voucher
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteSingle(transaction.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 text-xs"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}