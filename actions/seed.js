// seed.js

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";
import { randomUUID } from "crypto";

const ACCOUNT_ID = "86b3e1bf-83c3-48ba-a5c7-8654786312b1";
const USER_ID = "3696afd2-e2f8-4cf6-854e-9d7f724bb113";
const BATCH_SIZE = 100;

const CATEGORIES = {
  INCOME: [
    { name: "Sponsorship", range: [5000, 25000] },
    { name: "Donations", range: [1000, 15000] },
    { name: "Fundraising", range: [2000, 10000] },
    { name: "University Grants", range: [10000, 30000] },
    { name: "Other Income", range: [500, 5000] },
  ],
  EXPENSE: [
    { name: "Food", range: [2000, 8000] },
    { name: "Travel", range: [1000, 5000] },
    { name: "Camp Materials", range: [3000, 10000] },
    { name: "Cleaning Materials", range: [1000, 4000] },
    { name: "Awareness Material", range: [1000, 3000] },
    { name: "Craft Supplies", range: [500, 3000] },
    { name: "Food/Item Donation Bags", range: [2000, 7000] },
    { name: "Certificates & Printing", range: [1000, 5000] },
    { name: "Honorarium", range: [2000, 8000] },
    { name: "Miscellaneous", range: [500, 2000] },
  ],
};

function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomCategory(type) {
  const list = CATEGORIES[type];
  const selected = list[Math.floor(Math.random() * list.length)];
  const amount = getRandomAmount(...selected.range);
  return { category: selected.name, amount };
}

export async function seedTransactions() {
  try {
    const transactions = [];
    let totalBalance = 0;

    for (let i = 150; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const entriesToday = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < entriesToday; j++) {
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);

        transactions.push({
          id: randomUUID(),
          type,
          amount,
          description: `${type === "INCOME" ? "Received" : "Spent on"} ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        });

        totalBalance += type === "INCOME" ? amount : -amount;
      }
    }

    // Delete old data
    await db.transaction.deleteMany({ where: { accountId: ACCOUNT_ID } });

    // Insert in batches
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      await db.transaction.createMany({ data: batch });
    }

    // Update account balance
    await db.account.update({
      where: { id: ACCOUNT_ID },
      data: { balance: totalBalance },
    });

    console.log(`✅ Seeded ${transactions.length} transactions.`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error seeding transactions:", error);
    return {
      success: false,
      error: error?.message || "Unknown error occurred",
    };
  }
}