export function getBalanceChange(type, amount) {
  const value =
    typeof amount === "number" ? amount : amount?.toNumber?.() ?? Number(amount);
  return type === "EXPENSE" ? -value : value;
}

export function getAccountBalanceUpdates(original, updated) {
  const oldChange = getBalanceChange(original.type, original.amount);
  const newChange = getBalanceChange(updated.type, updated.amount);

  if (original.accountId !== updated.accountId) {
    return [
      { accountId: original.accountId, increment: -oldChange },
      { accountId: updated.accountId, increment: newChange },
    ];
  }

  return [{ accountId: updated.accountId, increment: newChange - oldChange }];
}
