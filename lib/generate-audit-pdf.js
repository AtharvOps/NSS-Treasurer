import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export function generateNssAuditPdf({
  reportRef,
  reportDate,
  accountName,
  selectedEvent,
  totalIncome,
  totalExpense,
  netBalance,
  categoryBreakdown,
  vouchers,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Institutional Header
  doc.setFillColor(30, 58, 138); // Deep Navy #1e3a8a
  doc.rect(margin, margin, pageWidth - margin * 2, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text("NATIONAL SERVICE SCHEME (NSS)", margin, margin + 8);

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("PVG's COET, PUNE NSS Unit • Student Welfare Division", margin, margin + 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Affiliated to Savitribai Phule Pune University (SPPU) & State NSS Directorate", margin, margin + 17.5);

  // Right-aligned report ref and date
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text("OFFICIAL AUDIT STATEMENT", pageWidth - margin, margin + 8, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Ref: ${reportRef}`, pageWidth - margin, margin + 13, { align: "right" });
  doc.text(`Date: ${reportDate}`, pageWidth - margin, margin + 17.5, { align: "right" });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 21, pageWidth - margin, margin + 21);

  // 2. Metadata Scope Grid
  let currentY = margin + 26;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 13, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 13, 2, 2, "D");

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Ledger Account:", margin + 4, currentY + 4.5);
  doc.text("Event / Activity:", margin + 50, currentY + 4.5);
  doc.text("Academic Session:", margin + 105, currentY + 4.5);
  doc.text("Audit Status:", margin + 145, currentY + 4.5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(accountName || "All Accounts", margin + 4, currentY + 9.5);
  doc.text(selectedEvent === "ALL" ? "Consolidated NSS Activities" : selectedEvent, margin + 50, currentY + 9.5);
  doc.text("AY 2025 – 2026", margin + 105, currentY + 9.5);

  doc.setTextColor(16, 185, 129); // Emerald
  doc.text("Verified by Treasurer", margin + 145, currentY + 9.5);

  // 3. Three Summary Stat Cards
  currentY += 17;
  const cardWidth = (pageWidth - margin * 2 - 8) / 3;

  // Card 1: Total Income
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, currentY, cardWidth, 16, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70);
  doc.text("TOTAL GRANTS & INCOME", margin + cardWidth / 2, currentY + 5, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(4, 120, 87);
  doc.text(`INR ${totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, margin + cardWidth / 2, currentY + 11.5, { align: "center" });

  // Card 2: Total Expenses
  const card2X = margin + cardWidth + 4;
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(card2X, currentY, cardWidth, 16, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(159, 18, 57);
  doc.text("TOTAL APPROVED EXPENSES", card2X + cardWidth / 2, currentY + 5, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(190, 18, 60);
  doc.text(`INR ${totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, card2X + cardWidth / 2, currentY + 11.5, { align: "center" });

  // Card 3: Net Balance
  const card3X = card2X + cardWidth + 4;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(card3X, currentY, cardWidth, 16, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text("NET BALANCE IN HAND", card3X + cardWidth / 2, currentY + 5, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text(`INR ${netBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, card3X + cardWidth / 2, currentY + 11.5, { align: "center" });

  // 4. Category-Wise Breakdown Table
  currentY += 21;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text("CATEGORY-WISE EXPENDITURE BREAKDOWN", margin, currentY);

  const categoryRows = categoryBreakdown.map((cat) => [
    cat.name,
    cat.count.toString(),
    `INR ${cat.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    `${cat.percentage.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: currentY + 2.5,
    margin: { left: margin, right: margin },
    head: [["Expense Head", "Vouchers Count", "Amount (INR)", "% of Total"]],
    body: categoryRows,
    theme: "grid",
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: "auto", fontStyle: "bold" },
      1: { halign: "center", cellWidth: 32 },
      2: { halign: "right", cellWidth: 42, fontStyle: "bold" },
      3: { halign: "right", cellWidth: 26 },
    },
  });

  // 5. Itemized Transactions Table
  const afterCatY = doc.lastAutoTable.finalY + 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`ITEMIZED VOUCHER LEDGER (${vouchers.length} RECORDS)`, margin, afterCatY);

  const voucherRows = vouchers.map((v, i) => [
    (i + 1).toString(),
    format(v.dateObj, "dd/MM/yyyy"),
    v.meta.cleanDescription + (v.meta.hasReceipt ? " (Receipt Attached)" : ""),
    v.meta.eventObj.shortName,
    v.category,
    v.meta.paymentMethod,
    `${v.type === "EXPENSE" ? "-" : "+"}INR ${Number(v.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: afterCatY + 2.5,
    margin: { left: margin, right: margin, bottom: 20 },
    head: [["S.N.", "Date", "Description & Purpose", "NSS Event", "Category", "Payment", "Amount (INR)"]],
    body: voucherRows,
    theme: "grid",
    showHead: "everyPage",
    styles: {
      fontSize: 7,
      cellPadding: 1.6,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "center", cellWidth: 20 },
      2: { cellWidth: 54 },
      3: { cellWidth: 30 },
      4: { cellWidth: 26 },
      5: { halign: "center", cellWidth: 16 },
      6: { halign: "right", cellWidth: 26, fontStyle: "bold" },
    },
    didParseCell: function (data) {
      if (data.section === "body" && data.column.index === 6) {
        const text = data.cell.raw;
        if (text.startsWith("+")) {
          data.cell.styles.textColor = [4, 120, 87]; // Emerald
        } else {
          data.cell.styles.textColor = [15, 23, 42]; // Slate
        }
      }
    },
  });

  // 6. Signature Blocks
  let finalY = doc.lastAutoTable.finalY + 8;
  if (finalY + 35 > pageHeight - margin) {
    doc.addPage();
    finalY = margin + 10;
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    '"Certified that the amounts stated above have been spent solely towards authorized NSS activities and supported by verified physical vouchers/receipts as per Government and University Audit Norms."',
    pageWidth / 2,
    finalY,
    { align: "center", maxWidth: pageWidth - margin * 2 }
  );

  finalY += 12;
  const sigColWidth = (pageWidth - margin * 2) / 4;
  const sigTitles = [
    { title: "NSS Student Treasurer", sub: "Prepared By" },
    { title: "Volunteer Secretary", sub: "Student Representative" },
    { title: "Programme Officer (PO)", sub: "NSS Unit Head / Faculty" },
    { title: "Principal / Director", sub: "Head of Institution & Seal" },
  ];

  sigTitles.forEach((sig, idx) => {
    const xCenter = margin + sigColWidth * idx + sigColWidth / 2;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.4);
    doc.line(margin + sigColWidth * idx + 4, finalY + 12, margin + sigColWidth * (idx + 1) - 4, finalY + 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(sig.title, xCenter, finalY + 16, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(sig.sub, xCenter, finalY + 19.5, { align: "center" });
  });

  // 7. Add Page Numbers & Footer to Every Page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `PVG's COET, PUNE NSS Cell • Official Audit Report • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Save the PDF file directly to client
  const filename = `NSS_Audit_Report_${(accountName || "PVGCOET").replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.pdf`;
  doc.save(filename);
}
