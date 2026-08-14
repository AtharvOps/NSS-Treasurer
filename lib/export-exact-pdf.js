import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Capture the exact DOM node and download as an authentic A4 PDF
 */
export async function downloadExactDomPdf(elementId, fileName = "NSS_Official_Audit_Report.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Report element not found");
  }

  // Clone or capture element with full scroll height
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= pdfHeight;

  // Add subsequent pages if the ledger spans multiple pages
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pdfHeight;
  }

  pdf.save(fileName);
}

/**
 * Open a clean, isolated print window with the exact report HTML and CSS
 * Bypasses all Next.js modals, radix overlays, and scroll wrappers
 */
export function printExactReportWindow(elementId, title = "NSS Official Audit Report") {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=800");
  if (!printWindow) {
    // If popup blocked, fallback to normal print
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((el) => el.outerHTML)
    .join("\n");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 10mm 10mm 10mm;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            font-size: 10pt !important;
            width: 100% !important;
            height: auto !important;
          }
          .audit-report-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 15px !important;
            box-shadow: none !important;
            border: none !important;
          }
          table {
            width: 100% !important;
            max-width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            page-break-inside: auto;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          th, td {
            padding: 4px 6px !important;
            border: 1px solid #cbd5e1 !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            font-size: 8.5pt !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 700 !important;
          }
          .signatures-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-top: 24px !important;
            padding-top: 16px !important;
          }
        </style>
      </head>
      <body>
        <div class="audit-report-container">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 350);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
