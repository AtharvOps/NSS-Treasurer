import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAccountBalanceUpdates } from "./transaction-balance.js";

describe("getAccountBalanceUpdates", () => {
  it("applies net delta when the account stays the same", () => {
    const updates = getAccountBalanceUpdates(
      { accountId: "a", type: "EXPENSE", amount: 500 },
      { accountId: "a", type: "EXPENSE", amount: 800 }
    );

    assert.deepEqual(updates, [{ accountId: "a", increment: -300 }]);
  });

  it("reverts the old account and applies the new effect when the account changes", () => {
    const updates = getAccountBalanceUpdates(
      { accountId: "a", type: "EXPENSE", amount: 500 },
      { accountId: "b", type: "EXPENSE", amount: 500 }
    );

    assert.deepEqual(updates, [
      { accountId: "a", increment: 500 },
      { accountId: "b", increment: -500 },
    ]);
  });

  it("handles amount and type changes while moving accounts", () => {
    const updates = getAccountBalanceUpdates(
      { accountId: "a", type: "EXPENSE", amount: 500 },
      { accountId: "b", type: "INCOME", amount: 1200 }
    );

    assert.deepEqual(updates, [
      { accountId: "a", increment: 500 },
      { accountId: "b", increment: 1200 },
    ]);
  });
});
