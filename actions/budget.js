"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    // Get current month's expenses
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses: expenses._sum.amount
        ? expenses._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";

export async function checkAndSendBudgetAlert(userId, { force = false } = {}) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        budgets: true,
      },
    });

    if (!user || !user.email) return { success: false, reason: "User or email not found" };

    const budget = user.budgets?.[0] || await db.budget.findFirst({ where: { userId } });
    if (!budget) return { success: false, reason: "No budget configured" };

    const budgetAmount = Number(budget.amount);
    if (budgetAmount <= 0) return { success: false, reason: "Budget amount is 0" };

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalExpenses = expenses._sum.amount ? expenses._sum.amount.toNumber() : 0;
    const percentageUsed = (totalExpenses / budgetAmount) * 100;

    // Check if threshold reached (80%) or if forced test
    const shouldSend = force || percentageUsed >= 80;

    if (!shouldSend) {
      return {
        success: true,
        alertSent: false,
        reason: `Spending (${percentageUsed.toFixed(1)}%) is below alert threshold (80%)`,
      };
    }

    // Check last alert sent timestamp (avoid duplicate email within 24 hours unless forced)
    if (!force && budget.lastAlertSent) {
      const lastSent = new Date(budget.lastAlertSent);
      const hoursSinceLastAlert = (currentDate.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastAlert < 24) {
        return {
          success: true,
          alertSent: false,
          reason: "Alert already sent within the last 24 hours",
        };
      }
    }

    const defaultAccount = user.accounts?.find((a) => a.isDefault) || user.accounts?.[0];
    const accountName = defaultAccount?.name || "NSS Ledger Account";

    const emailResult = await sendEmail({
      to: user.email,
      subject: `🚨 NSS Budget Alert: ${percentageUsed >= 100 ? "Limit Exceeded" : "80% Cap Reached"} (${accountName})`,
      react: EmailTemplate({
        userName: user.name || "NSS Treasurer",
        type: "budget-alert",
        data: {
          percentageUsed,
          budgetAmount: budgetAmount.toFixed(1),
          totalExpenses: totalExpenses.toFixed(1),
          accountName,
        },
      }),
    });

    if (emailResult.success) {
      await db.budget.update({
        where: { id: budget.id },
        data: { lastAlertSent: new Date() },
      });
      return { success: true, alertSent: true, email: user.email };
    } else {
      console.error("Failed to send budget alert email:", emailResult.error);
      return { success: false, error: emailResult.error };
    }
  } catch (error) {
    console.error("Error in checkAndSendBudgetAlert:", error);
    return { success: false, error: error.message };
  }
}

export async function sendTestBudgetAlertEmail() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized. Please log in.");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found.");

    const result = await checkAndSendBudgetAlert(user.id, { force: true });
    return result;
  } catch (error) {
    console.error("Error sending test budget alert:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Update or create budget
    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
      },
    });

    // Check if new budget amount immediately crosses alert threshold
    await checkAndSendBudgetAlert(user.id).catch((e) =>
      console.warn("Budget alert check post-update warning:", e?.message)
    );

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}