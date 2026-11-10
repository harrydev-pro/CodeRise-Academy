// A program's current price is its promotional price when one is set and lower than the
// regular price; otherwise it is the regular (original) price.
export function getProgramPrice(program) {
  const original = Number(program?.originalPrice ?? 0) || 0;
  const promotional = program?.promotionalPrice;
  if (promotional === null || promotional === undefined || promotional === "") return original;
  const promotionalNumber = Number(promotional);
  return Number.isFinite(promotionalNumber) && promotionalNumber >= 0 && promotionalNumber < original
    ? promotionalNumber
    : original;
}

export function hasProgramDiscount(program) {
  return getProgramPrice(program) < (Number(program?.originalPrice ?? 0) || 0);
}
