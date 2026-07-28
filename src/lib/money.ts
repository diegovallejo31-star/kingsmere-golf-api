/**
 * Money is held in pence throughout - integers only.
 *
 * A member who joins in the middle of the season does not pay a full year.
 * The subscription is the category rate apportioned over the days left of the
 * playing year, so a full member joining at midsummer pays for the half of the
 * year they get. Do the apportionment in floating point and two members who
 * joined on the same day are billed a penny apart, which is the sort of thing a
 * club treasurer hears about at the AGM.
 */
export const PENCE_IN_POUND = 100;

export function isWholePence(amount: number): boolean {
  return Number.isInteger(amount);
}

/** Formats pence as a plain decimal string, for logs and human-facing text. */
export function formatPence(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}${Math.floor(abs / PENCE_IN_POUND)}.${String(abs % PENCE_IN_POUND).padStart(2, '0')}`;
}

/**
 * Splits an amount into shares that add back to exactly the amount.
 *
 * The remainder goes a penny at a time to the earlier shares, so no share is
 * more than a penny adrift of any other and the total is never short.
 */
export function splitEvenly(amount: number, parts: number): number[] {
  if (parts <= 0) throw new Error('splitEvenly needs at least one part');
  const base = Math.floor(amount / parts);
  const shares = Array.from({ length: parts }, () => base);
  let left = amount - base * parts;
  for (let index = 0; left > 0; index += 1, left -= 1) {
    shares[index % parts] = (shares[index % parts] ?? 0) + 1;
  }
  return shares;
}

/** A percentage of an amount in basis points, rounded down to the penny. */
export function bpsOf(amount: number, bps: number): number {
  return Math.floor((amount * bps) / 10_000);
}
