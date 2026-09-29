export function parseAmount(value: string | number): number {
  const amount = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}
