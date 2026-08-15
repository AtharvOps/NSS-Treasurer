"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { checkAndSendBudgetAlert } from "@/actions/budget";
import { getAccountBalanceUpdates } from "@/lib/transaction-balance";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          receiptUrl: data.receiptUrl || null,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    // Check and send budget alert in background if this is an expense
    if (data.type === "EXPENSE") {
      checkAndSendBudgetAlert(user.id).catch((err) =>
        console.warn("Budget alert trigger warning:", err?.message)
      );
    }

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance changes
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    const accountBalanceUpdates = getAccountBalanceUpdates(
      {
        accountId: originalTransaction.accountId,
        type: originalTransaction.type,
        amount: originalTransaction.amount,
      },
      {
        accountId: data.accountId,
        type: data.type,
        amount: data.amount,
      }
    );

    const transaction = await db.$transaction(async (tx) => {
      const newAccount = await tx.account.findUnique({
        where: {
          id: data.accountId,
          userId: user.id,
        },
      });

      if (!newAccount) {
        throw new Error("Account not found");
      }

      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          receiptUrl: data.receiptUrl !== undefined ? data.receiptUrl : undefined,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      for (const { accountId, increment } of accountBalanceUpdates) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment,
            },
          },
        });
      }

      return updated;
    });

    if (data.type === "EXPENSE") {
      checkAndSendBudgetAlert(user.id).catch((err) =>
        console.warn("Budget alert trigger warning on update:", err?.message)
      );
    }

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);
    if (originalTransaction.accountId !== data.accountId) {
      revalidatePath(`/account/${originalTransaction.accountId}`);
    }

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Scan Receipt
export async function scanReceipt(file) {
  const models = [
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];
  
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const receiptDataUrl = `data:${mimeType};base64,${base64String}`;

    const prompt = `
      Analyze the receipt image and extract the following information in **valid JSON** format:

      - Total amount (number only)
      - Date (in ISO format, e.g., 2024-07-20)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: Sponsorship, Donations, Fundraising, University Grants, Other Income, Food, Travel, Camp Materials, Cleaning Materials, Awareness Material, Craft Supplies, Food/Item Donation Bags, Certificates & Printing, Honorarium, Miscellaneous)

      Respond **only** with valid JSON in this exact format:

      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If this is not a receipt, return an empty object: {}
    `;

    let lastError = null;

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          {
            inlineData: {
              data: base64String,
              mimeType: mimeType,
            },
          },
          prompt,
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        const data = JSON.parse(cleanedText);
        return {
          amount: parseFloat(data.amount) || 0,
          date: data.date ? new Date(data.date) : new Date(),
          description: data.description || "Scanned Receipt",
          category: data.category || "Miscellaneous",
          merchantName: data.merchantName || "",
          receiptUrl: receiptDataUrl,
        };
      } catch (err) {
        lastError = err;
        console.warn(`Receipt scan with ${modelName} failed, trying fallback...`, err?.message);
      }
    }

    throw lastError || new Error("Failed to scan receipt with available Gemini models");
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt: " + (error.message || "Invalid response"));
  }
}

