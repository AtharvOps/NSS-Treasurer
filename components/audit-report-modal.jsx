"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Download, FileText, CheckCircle2 } from "lucide-react";
import { parseNssMetadata, NSS_EVENTS } from "@/data/nss-events";
import { generateNssAuditPdf } from "@/lib/generate-audit-pdf";
import { printExactReportWindow, downloadExactDomPdf } from "@/lib/export-exact-pdf";
import { toast } from "sonner";

export function AuditReportModal({
  transactions = [],
  accountName = "NSS Main Operations Account",
  triggerButton,
}) {
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState("ALL_TIME");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Parse all transactions with NSS metadata
  const parsedTransactions = useMemo(() => {
    return transactions.map((t) => ({
      ...t,
      meta: parseNssMetadata(t),
      dateObj: new Date(t.date),
    }));
  }, [transactions]);

  // Filter transactions based on selection
  const filtered = useMemo(() => {
    let list = parsedTransactions;

    if (selectedEvent !== "ALL") {
      list = list.filter(
        (t) =>
          t.meta.eventName.toLowerCase() === selectedEvent.toLowerCase() ||
          t.meta.eventObj.name.toLowerCase() === selectedEvent.toLowerCase()
      );
    }

    const now = new Date();
    if (selectedPeriod === "THIS_MONTH") {
      list = list.filter(
        (t) =>
          t.dateObj.getMonth() === now.getMonth() &&
          t.dateObj.getFullYear() === now.getFullYear()
      );
    } else if (selectedPeriod === "AY_2025_26") {
      list = list.filter(
        (t) => t.dateObj.getFullYear() >= 2025 && t.dateObj.getFullYear() <= 2026
      );
    }

    return list.sort((a, b) => a.dateObj - b.dateObj);
  }, [parsedTransactions, selectedEvent, selectedPeriod]);

  // Calculations
  const totalIncome = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [filtered]
  );

  const totalExpense = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [filtered]
  );

  const netBalance = totalIncome - totalExpense;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const expenses = filtered.filter((t) => t.type === "EXPENSE");
    const map = {};
    expenses.forEach((t) => {
      const cat = t.category || "Miscellaneous";
      if (!map[cat]) {
        map[cat] = { count: 0, total: 0 };
      }
      map[cat].count += 1;
      map[cat].total += Number(t.amount || 0);
    });

    return Object.entries(map).map(([name, stat]) => ({
      name,
      count: stat.count,
      total: stat.total,
      percentage: totalExpense > 0 ? (stat.total / totalExpense) * 100 : 0,
    }));
  }, [filtered, totalExpense]);

  const reportDate = format(new Date(), "dd MMMM yyyy");
  const reportRef = `NSS-AUDIT-${format(new Date(), "yyyyMMdd")}-${filtered.length}`;

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      // Generate clean vector PDF with full ledger table
      generateNssAuditPdf({
        reportRef,
        reportDate,
        accountName,
        selectedEvent,
        totalIncome,
        totalExpense,
        netBalance,
        categoryBreakdown,
        vouchers: filtered,
      });
      toast.success("Official NSS Audit Report PDF downloaded successfully!");
    } catch (err) {
      console.error("Vector PDF error, falling back to DOM PDF:", err);
      try {
        await downloadExactDomPdf("nss-audit-report-document", `NSS_Audit_Report_${reportRef}.pdf`);
        toast.success("NSS Audit Report PDF downloaded successfully!");
      } catch (domErr) {
        console.error("DOM PDF error:", domErr);
        toast.error("Opening print view for direct Save as PDF...");
        printExactReportWindow("nss-audit-report-document", "Official NSS Financial Audit Report");
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    printExactReportWindow("nss-audit-report-document", "Official NSS Financial Audit Report - PVG's COET, PUNE");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="gap-2 border-blue-900/30 text-blue-900 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300">
            <FileText className="h-4 w-4 text-blue-900 dark:text-blue-300" />
            <span>Generate Audit Report</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-blue-900/20 audit-dialog-content">
        <DialogHeader className="no-print p-4 sm:p-6 pb-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900">
          <div>
            <DialogTitle className="text-lg font-bold text-blue-950 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-900 dark:text-blue-300" />
              Official NSS Financial Audit Report Preview
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified ledger format conforming to Government of India NSS Directorate norms
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 font-bold shadow-md text-xs sm:text-sm"
              size="sm"
            >
              <Download className="h-4 w-4" />
              <span>{isGeneratingPdf ? "Generating PDF..." : "Download PDF Report"}</span>
            </Button>

            <Button
              onClick={handlePrint}
              className="bg-blue-950 hover:bg-blue-900 text-white gap-2 font-semibold shadow-sm text-xs sm:text-sm"
              size="sm"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Export PDF</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Filter controls (Hidden when printed) */}
        <div className="no-print px-4 sm:px-6 py-3 bg-blue-50/50 dark:bg-blue-950/20 border-b flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-blue-950 dark:text-blue-200">Report Filters:</span>
          <div className="w-48">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-900">
                <SelectValue placeholder="All NSS Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All NSS Events &amp; Camps</SelectItem>
                {NSS_EVENTS.map((evt) => (
                  <SelectItem key={evt.id} value={evt.name}>
                    {evt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-900">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_TIME">All Transactions</SelectItem>
                <SelectItem value="AY_2025_26">Academic Year (2025–26)</SelectItem>
                <SelectItem value="THIS_MONTH">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-muted-foreground ml-auto">
            Showing <strong className="text-foreground">{filtered.length}</strong> vouchers
          </span>
        </div>

        {/* PRINTABLE REPORT CONTAINER */}
        <div id="nss-audit-report-document" className="audit-report-container p-6 sm:p-8 bg-white text-slate-900 font-sans space-y-6">
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 shrink-0">
                <Image
                  src="/nss-bg.png"
                  alt="NSS Emblem"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-blue-950 uppercase">
                  National Service Scheme (NSS)
                </h1>
                <h2 className="text-sm font-bold text-slate-800">
                  PVG&apos;s COET, PUNE NSS Unit • Student Welfare Division
                </h2>
                <p className="text-xs text-slate-600">
                  Affiliated to Savitribai Phule Pune University (SPPU) &amp; State NSS Directorate
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-1">
              <div className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 border border-blue-200 rounded inline-block">
                OFFICIAL AUDIT STATEMENT
              </div>
              <div className="text-slate-600">Ref: <span className="font-mono font-semibold">{reportRef}</span></div>
              <div className="text-slate-600">Date: <span className="font-semibold">{reportDate}</span></div>
            </div>
          </div>

          {/* Statement Metadata & Scope */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded border border-slate-200">
            <div>
              <span className="text-slate-500 block">Ledger Account:</span>
              <strong className="text-slate-800">{accountName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Event / Activity:</span>
              <strong className="text-slate-800">{selectedEvent === "ALL" ? "Consolidated NSS Activities" : selectedEvent}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Academic Session:</span>
              <strong className="text-slate-800">2025 – 2026</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Audit Status:</span>
              <strong className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified by Treasurer
              </strong>
            </div>
          </div>

          {/* Income vs Expenditure Summary Cards */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="border border-emerald-300 bg-emerald-50/50 p-3 rounded-lg">
              <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                Total Grants &amp; Income
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 font-mono">
                ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                {filtered.filter((t) => t.type === "INCOME").length} income entries
              </div>
            </div>

            <div className="border border-rose-300 bg-rose-50/50 p-3 rounded-lg">
              <div className="text-xs font-semibold text-rose-800 uppercase tracking-wide">
                Total Approved Expenses
              </div>
              <div className="text-xl sm:text-2xl font-bold text-rose-700 mt-1 font-mono">
                ₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5">
                {filtered.filter((t) => t.type === "EXPENSE").length} expense vouchers
              </div>
            </div>

            <div className="border border-blue-300 bg-blue-50/50 p-3 rounded-lg">
              <div className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                Net Balance in Hand
              </div>
              <div className={`text-xl sm:text-2xl font-bold mt-1 font-mono ${netBalance >= 0 ? "text-blue-900" : "text-rose-700"}`}>
                ₹{netBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-blue-700 mt-0.5">
                {totalIncome > 0 ? `${((totalExpense / totalIncome) * 100).toFixed(1)}% Fund Utilized` : "Active Balance"}
              </div>
            </div>
          </div>

          {/* Category-Wise Breakdown Table */}
          {categoryBreakdown.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1">
                Category-Wise Expenditure Breakdown
              </h3>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-semibold text-slate-700 border-b">
                    <tr>
                      <th className="py-2 px-3">Expense Head</th>
                      <th className="py-2 px-3 text-center">Vouchers Count</th>
                      <th className="py-2 px-3 text-right">Amount (INR)</th>
                      <th className="py-2 px-3 text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categoryBreakdown.map((cat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-3 font-medium text-slate-800">{cat.name}</td>
                        <td className="py-1.5 px-3 text-center text-slate-600">{cat.count}</td>
                        <td className="py-1.5 px-3 text-right font-mono text-slate-900">
                          ₹{cat.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono text-slate-600">
                          {cat.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Itemized Transactions Ledger */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b pb-1">
              Itemized Voucher Ledger ({filtered.length} Records)
            </h3>
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-xs text-left table-fixed border-collapse">
                <colgroup>
                  <col className="w-[6%]" />
                  <col className="w-[12%]" />
                  <col className="w-[32%]" />
                  <col className="w-[18%]" />
                  <col className="w-[14%]" />
                  <col className="w-[8%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-slate-100 font-semibold text-slate-700 border-b">
                  <tr>
                    <th className="py-2 px-2 text-center">S.N.</th>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Description &amp; Purpose</th>
                    <th className="py-2 px-2">NSS Event</th>
                    <th className="py-2 px-2">Category</th>
                    <th className="py-2 px-2 text-center">Payment</th>
                    <th className="py-2 px-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-500">
                        No transactions found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-2 text-center font-mono text-slate-500">{index + 1}</td>
                        <td className="py-1.5 px-2 whitespace-nowrap text-slate-700 text-[11px]">
                          {format(item.dateObj, "dd/MM/yyyy")}
                        </td>
                        <td className="py-1.5 px-2 font-medium text-slate-900 break-words">
                          <div>{item.meta.cleanDescription}</div>
                          {item.meta.hasReceipt && (
                            <span className="text-[10px] text-emerald-700 font-normal block">
                              ✓ Voucher attached
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-slate-600 text-[11px] break-words">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 inline-block">
                            {item.meta.eventObj.shortName}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-600 capitalize text-[11px] break-words">{item.category}</td>
                        <td className="py-1.5 px-2 text-center text-[11px] text-slate-600">
                          {item.meta.paymentMethod}
                        </td>
                        <td className={`py-1.5 px-2 text-right font-mono font-semibold whitespace-nowrap text-[11px] ${item.type === "EXPENSE" ? "text-slate-900" : "text-emerald-700"}`}>
                          {item.type === "EXPENSE" ? "-" : "+"}₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-300 text-slate-900">
                  <tr>
                    <td colSpan={6} className="py-2 px-3 text-right">Net Expenditure Total:</td>
                    <td className="py-2 px-2 text-right font-mono text-xs">
                      ₹{totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Official NSS Declaration & Signatures Block */}
          <div className="signatures-block pt-8 border-t-2 border-slate-300 space-y-8">
            <p className="text-[11px] text-slate-600 italic text-center">
              &quot;Certified that the amounts stated above have been spent solely towards authorized NSS activities and 
              supported by verified physical vouchers/receipts as per Government and University Audit Norms.&quot;
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs pt-4">
              <div className="space-y-12">
                <div className="h-10 border-b border-dashed border-slate-400"></div>
                <div>
                  <div className="font-bold text-slate-900">NSS Student Treasurer</div>
                  <div className="text-[10px] text-slate-500">Prepared By</div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="h-10 border-b border-dashed border-slate-400"></div>
                <div>
                  <div className="font-bold text-slate-900">Volunteer Secretary</div>
                  <div className="text-[10px] text-slate-500">Student Representative</div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="h-10 border-b border-dashed border-slate-400"></div>
                <div>
                  <div className="font-bold text-slate-900">Programme Officer (PO)</div>
                  <div className="text-[10px] text-slate-500">NSS Unit Head / Faculty</div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="h-10 border-b border-dashed border-slate-400"></div>
                <div>
                  <div className="font-bold text-slate-900">Principal / Director</div>
                  <div className="text-[10px] text-slate-500">Head of Institution &amp; Seal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
