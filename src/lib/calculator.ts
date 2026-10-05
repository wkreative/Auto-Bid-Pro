export function parseAmount(value: string | number): number {
  const amount = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

/** Broker fee from the supplied Auto Broker PR rate table. */
export function brokerFee(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (price < 1000) return 350;
  if (price < 5000) return 750;
  if (price < 15000) return 999;
  return Math.round((price * 0.08 + Number.EPSILON) * 100) / 100;
}

export function auctionCosts(price: number, otherCosts = 0, discountedPayment = false) {
  const amount = Math.round(parseAmount(price) * 100);
  const broker = Math.round(brokerFee(amount / 100) * 100);
  const paperwork = amount > 0 ? 35000 : 0;
  const paymentCharge = discountedPayment ? 0 : Math.round(amount * 0.04);
  const other = Math.round(parseAmount(otherCosts) * 100);
  return {
    broker: broker / 100,
    paperwork: paperwork / 100,
    paymentCharge: paymentCharge / 100,
    total: (amount + broker + paperwork + paymentCharge + other) / 100,
  };
}

// Search in cents, including fee jumps at the boundaries of each price tier.
export function maximumOffer(resaleValue: number, otherCosts = 0, discountedPayment = false) {
  let low = 0;
  let high = Math.floor(parseAmount(resaleValue) * 100);
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (auctionCosts(middle / 100, otherCosts, discountedPayment).total <= resaleValue) low = middle;
    else high = middle - 1;
  }
  return low / 100;
}
