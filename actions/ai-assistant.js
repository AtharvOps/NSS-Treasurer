"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseNssMetadata } from "@/data/nss-events";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FALLBACK_MODELS = [
  "gemini-3.7-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

export async function askNssAiAssistant({ prompt, history = [] }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized. Please log in to use the NSS AI Assistant.");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User account not found.");
    }

    // Fetch live user accounts, transactions, and budget
    const [accounts, transactions, budget] = await Promise.all([
      db.account.findMany({
        where: { userId: user.id },
      }),
      db.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
      }),
      db.budget.findUnique({
        where: { userId: user.id },
      }),
    ]);

    // Parse transactions with NSS metadata
    const parsedTransactions = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      date: t.date.toISOString().split("T")[0],
      category: t.category,
      receiptUrl: t.receiptUrl,
      ...parseNssMetadata(t),
    }));

    // Aggregate statistics for AI prompt context
    const totalIncome = parsedTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = parsedTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // Expenses by category
    const categoryExpenses = {};
    parsedTransactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      });

    // Expenses by NSS Event
    const eventExpenses = {};
    parsedTransactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const evt = t.eventName || "Regular Activities";
        eventExpenses[evt] = (eventExpenses[evt] || 0) + t.amount;
      });

    // Pending reimbursements
    const pendingReimbursements = parsedTransactions.filter(
      (t) => t.reimbursementStatus === "Pending Approval"
    );

    // Missing vouchers
    const missingVouchers = parsedTransactions.filter(
      (t) => t.type === "EXPENSE" && !t.hasReceipt
    );

    // Prepare system prompt with strict NSS context and accurate financial snapshot
    const systemContext = `
You are the "NSS AI Treasurer Assistant", a specialized and highly professional financial copilot for the National Service Scheme (NSS) Unit Treasurer, Programme Officer (PO), and Student Welfare Directorate at PVG's COET, PUNE (Affiliated to SPPU).

Here is the CURRENT LIVE FINANCIAL SNAPSHOT for PVG's COET, PUNE NSS Unit:
- Total Unit Accounts: ${accounts.length} (${accounts.map((a) => `${a.name}: ₹${Number(a.balance).toFixed(2)}`).join(", ")})
- Total Transactions Recorded: ${parsedTransactions.length}
- Total Income / Grants Received: ₹${totalIncome.toFixed(2)}
- Total Approved Expenses: ₹${totalExpense.toFixed(2)}
- Net Available NSS Balance: ₹${netBalance.toFixed(2)}
- Monthly Budget Target: ${budget ? `₹${Number(budget.amount).toFixed(2)}` : "Not set"}

EXPENSES BY CATEGORY:
${Object.entries(categoryExpenses)
  .map(([k, v]) => `- ${k}: ₹${v.toFixed(2)}`)
  .join("\n") || "No expenses recorded yet"}

EXPENSES BY NSS EVENT / CAMP:
${Object.entries(eventExpenses)
  .map(([k, v]) => `- ${k}: ₹${v.toFixed(2)}`)
  .join("\n") || "No camp expenses recorded yet"}

PENDING REIMBURSEMENTS: ${pendingReimbursements.length} pending approval (Totaling ₹${pendingReimbursements.reduce((s, t) => s + t.amount, 0).toFixed(2)})
EXPENSES WITHOUT PROOF / VOUCHER: ${missingVouchers.length} records

RECENT TRANSACTIONS SAMPLE:
${parsedTransactions
  .slice(0, 10)
  .map(
    (t) =>
      `• [${t.date}] ${t.type === "EXPENSE" ? "Expense" : "Income"} ₹${t.amount} | ${t.cleanDescription} | Event: ${t.eventName} | Category: ${t.category} | Method: ${t.paymentMethod} | Status: ${t.reimbursementStatus}`
  )
  .join("\n")}

YOUR GUIDELINES:
1. Always give exact numbers matching the live financial snapshot above.
2. College name must always be formatted as "PVG's COET, PUNE".
3. If drafting an "Expense Justification Note" or "Letter for Programme Officer (PO)", format it as a formal NSS memorandum with Subject, Reference, Event Details, Amount Breakdown, and Signature placeholder for the NSS Treasurer.
4. If checking audit compliance, highlight missing receipts or vouchers and suggest corrective actions before the university audit.
5. Keep your responses clear, well-structured in Markdown (with bullet points, bold highlights, and tables where appropriate), and encouraging of the NSS spirit.
`;

    let lastError = null;

    // Try available models starting with gemini-3.7-flash
    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const formattedHistory = [
          {
            role: "user",
            parts: [{ text: "System Context for PVG's COET, PUNE NSS Treasurer Assistant:\n" + systemContext }],
          },
          {
            role: "model",
            parts: [
              {
                text: "Namaste! I am your NSS AI Treasurer Assistant for PVG's COET, PUNE. I am connected to your live accounts, camp budgets, vouchers, and audit data. How can I assist you today?",
              },
            ],
          },
          ...history.slice(-6).map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })),
        ];

        const chat = model.startChat({
          history: formattedHistory,
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const responseText = response.text();

        return {
          success: true,
          answer: responseText,
          modelUsed: modelName,
        };
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} encountered error, attempting fallback:`, err?.message);
      }
    }

    throw lastError || new Error("Failed to generate response across all Gemini models");
  } catch (error) {
    console.error("NSS AI Assistant Error:", error);
    return {
      success: false,
      error: error.message || "Failed to process question. Please verify GEMINI_API_KEY.",
    };
  }
}
