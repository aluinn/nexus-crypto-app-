export function holdingValue(quantity: number, price: number) {
  if (!Number.isFinite(quantity) || !Number.isFinite(price)) return 0;
  return quantity * price;
}

export function portfolioTotal(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}

export function allocationPercent(value: number, total: number) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0;
  return (value / total) * 100;
}

/** Value change from a previous price to the current price. */
export function valueChange(quantity: number, current: number, previous?: number) {
  if (previous == null || !Number.isFinite(previous) || previous <= 0) return undefined;
  return quantity * (current - previous);
}

/** Previous price implied by a percentage change from that price to `current`. */
export function priceBeforeChange(current: number, changePercent?: number) {
  if (changePercent == null || !Number.isFinite(changePercent)) return undefined;
  const factor = 1 + changePercent / 100;
  if (factor === 0) return undefined;
  return current / factor;
}
