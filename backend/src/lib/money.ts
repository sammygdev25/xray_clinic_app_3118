import { Prisma } from '@prisma/client';
// Scaffold-owned (money, PX.156): money columns are Prisma Decimal, exact in the database. Every JSON answer turns a
// Decimal back into a plain number, so the pages read 9.5, not "9.5". JSON.stringify calls a Decimal's toJSON (a string)
// before the replacer runs, so the replacer reads the raw value from the holder.
export function decimalsAsNumbers(this: unknown, key: string, value: unknown): unknown {
  const raw = this !== null && typeof this === 'object' ? (this as Record<string, unknown>)[key] : undefined;
  return Prisma.Decimal.isDecimal(raw) ? (raw as Prisma.Decimal).toNumber() : value;
}
