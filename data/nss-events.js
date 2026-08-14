export const NSS_EVENTS = [
  {
    id: "7-day-camp",
    name: "7-Day Annual Special Camp",
    shortName: "7-Day Camp",
    color: "#be123c", // crimson
    bgColor: "bg-rose-50 text-rose-700 border-rose-200",
    badgeColor: "#be123c",
    defaultBudget: 45000,
    description: "Annual 7-day residential camp in adopted rural village",
  },
  {
    id: "blood-donation",
    name: "Blood Donation & Health Drive",
    shortName: "Blood Donation",
    color: "#dc2626", // red
    bgColor: "bg-red-50 text-red-700 border-red-200",
    badgeColor: "#dc2626",
    defaultBudget: 15000,
    description: "Mega blood donation drive in collaboration with Red Cross",
  },
  {
    id: "tree-plantation",
    name: "Tree Plantation & Environment",
    shortName: "Tree Plantation",
    color: "#16a34a", // green
    bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeColor: "#16a34a",
    defaultBudget: 12000,
    description: "Campus & community sapling plantation drive (Van Mahotsav)",
  },
  {
    id: "swachh-bharat",
    name: "Swachh Bharat Cleanliness Drive",
    shortName: "Swachh Bharat",
    color: "#0284c7", // sky
    bgColor: "bg-sky-50 text-sky-700 border-sky-200",
    badgeColor: "#0284c7",
    defaultBudget: 10000,
    description: "Campus and public water body cleanliness campaigns",
  },
  {
    id: "national-youth-day",
    name: "Youth Festival & National Days",
    shortName: "Youth Festival",
    color: "#d97706", // amber / saffron
    bgColor: "bg-amber-50 text-amber-800 border-amber-200",
    badgeColor: "#d97706",
    defaultBudget: 18000,
    description: "National Youth Day, NSS Day (24th Sep) & cultural conventions",
  },
  {
    id: "disaster-relief",
    name: "Disaster Management & Relief",
    shortName: "Disaster Relief",
    color: "#7c3aed", // purple
    bgColor: "bg-purple-50 text-purple-700 border-purple-200",
    badgeColor: "#7c3aed",
    defaultBudget: 25000,
    description: "Emergency relief kit packaging & distribution drives",
  },
  {
    id: "regular-activities",
    name: "Regular Activities & Campus Drives",
    shortName: "Regular Activities",
    color: "#1e3a8a", // navy
    bgColor: "bg-blue-50 text-blue-800 border-blue-200",
    badgeColor: "#1e3a8a",
    defaultBudget: 20000,
    description: "Weekly awareness, literacy teaching & community service",
  },
];

export const PAYMENT_METHODS = [
  { id: "UPI", label: "UPI / QR", icon: "QrCode", color: "bg-emerald-100 text-emerald-800" },
  { id: "Cash", label: "Cash (Voucher)", icon: "Banknote", color: "bg-amber-100 text-amber-800" },
  { id: "Bank Transfer", label: "Bank Transfer (NEFT/RTGS)", icon: "Building2", color: "bg-blue-100 text-blue-800" },
  { id: "Cheque", label: "Cheque", icon: "FileSpreadsheet", color: "bg-purple-100 text-purple-800" },
];

export const REIMBURSEMENT_STATUSES = [
  {
    id: "Direct Expense",
    label: "Direct Expense",
    variant: "default",
    color: "bg-blue-600 text-white",
    description: "Paid directly from NSS Unit funds",
  },
  {
    id: "Reimbursed",
    label: "Reimbursed",
    variant: "success",
    color: "bg-emerald-600 text-white",
    description: "Settled to volunteer / officer",
  },
  {
    id: "Pending Approval",
    label: "Pending Approval",
    variant: "warning",
    color: "bg-amber-500 text-white",
    description: "Awaiting PO verification & reimbursement",
  },
];

/**
 * Parses embedded NSS tags from a transaction's description.
 * Supports syntax like:
 * "[Event: 7-Day Annual Special Camp] [Payment: UPI] [Status: Reimbursed] [Receipt: Yes] Bought groceries for camp"
 */
export function parseNssMetadata(transaction) {
  const description = transaction?.description || "";
  
  // Extract event tag
  const eventMatch = description.match(/\[(?:Event|Camp):\s*([^\]]+)\]/i);
  let eventName = eventMatch ? eventMatch[1].trim() : null;
  
  // If not explicitly tagged, infer from category or description keywords
  if (!eventName) {
    const descLower = description.toLowerCase();
    const catLower = (transaction?.category || "").toLowerCase();
    if (descLower.includes("camp") || catLower.includes("camp")) {
      eventName = "7-Day Annual Special Camp";
    } else if (descLower.includes("blood") || descLower.includes("donation")) {
      eventName = "Blood Donation & Health Drive";
    } else if (descLower.includes("tree") || descLower.includes("plant")) {
      eventName = "Tree Plantation & Environment";
    } else if (descLower.includes("clean") || descLower.includes("swachh")) {
      eventName = "Swachh Bharat Cleanliness Drive";
    } else if (descLower.includes("youth") || descLower.includes("rally")) {
      eventName = "Youth Festival & National Days";
    } else {
      eventName = "Regular Activities & Campus Drives";
    }
  }

  // Extract payment method tag
  const paymentMatch = description.match(/\[(?:Payment|Mode|Method):\s*([^\]]+)\]/i);
  const paymentMethod = paymentMatch ? paymentMatch[1].trim() : "UPI";

  // Extract reimbursement status tag
  const statusMatch = description.match(/\[(?:Status|Reimburse|Reimbursement):\s*([^\]]+)\]/i);
  const reimbursementStatus = statusMatch ? statusMatch[1].trim() : "Direct Expense";

  // Check for receipt attached
  const receiptMatch = description.match(/\[Receipt:\s*([^\]]+)\]/i);
  const hasReceipt = Boolean(
    transaction?.receiptUrl || 
    (receiptMatch && !receiptMatch[1].toLowerCase().includes("no")) ||
    description.toLowerCase().includes("receipt attached")
  );

  // Clean description without bracket tags
  const cleanDescription = description
    .replace(/\[(Event|Camp|Payment|Mode|Method|Status|Reimburse|Reimbursement|Receipt):[^\]]+\]\s*/gi, "")
    .trim() || description;

  const eventObj = NSS_EVENTS.find(
    (e) => e.name.toLowerCase() === eventName.toLowerCase() || e.shortName.toLowerCase() === eventName.toLowerCase()
  ) || NSS_EVENTS[NSS_EVENTS.length - 1];

  return {
    rawDescription: description,
    cleanDescription: cleanDescription || "NSS Operational Expense",
    eventName,
    eventObj,
    paymentMethod,
    reimbursementStatus,
    hasReceipt,
  };
}

/**
 * Formats a description string with embedded NSS tags so that no backend schema changes are required.
 */
export function formatNssDescription({
  description = "",
  eventName = "Regular Activities & Campus Drives",
  paymentMethod = "UPI",
  reimbursementStatus = "Direct Expense",
  hasReceipt = false,
}) {
  const clean = description
    .replace(/\[(Event|Camp|Payment|Mode|Method|Status|Reimburse|Reimbursement|Receipt):[^\]]+\]\s*/gi, "")
    .trim();

  const tags = [];
  if (eventName) tags.push(`[Event: ${eventName}]`);
  if (paymentMethod) tags.push(`[Payment: ${paymentMethod}]`);
  if (reimbursementStatus) tags.push(`[Status: ${reimbursementStatus}]`);
  if (hasReceipt) tags.push(`[Receipt: Yes]`);

  return `${tags.join(" ")} ${clean}`.trim();
}
