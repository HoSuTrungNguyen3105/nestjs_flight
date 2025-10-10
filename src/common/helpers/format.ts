import { Prisma } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';

export class DecimalUtils {
  static dateToDecimal(date: Date): Prisma.Decimal {
    return new Prisma.Decimal(date.getTime());
  }

  static isInDateRange(
    checkDate: Prisma.Decimal,
    startDate: Prisma.Decimal,
    endDate: Prisma.Decimal,
  ): boolean {
    const checkTime = checkDate.toNumber();
    const startTime = startDate.toNumber();
    const endTime = endDate.toNumber();

    return checkTime >= startTime && checkTime <= endTime;
  }

  static calculateDaysBetween(
    startDate: Prisma.Decimal,
    endDate: Prisma.Decimal,
  ): number {
    const startTime = startDate.toNumber();
    const endTime = endDate.toNumber();

    const diffTime = Math.abs(endTime - startTime);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export function nowDecimal(): Prisma.Decimal {
  return new Prisma.Decimal(Date.now().toString());
}

export function dateToDecimal(date: Date): Decimal {
  return new Decimal(date.getTime());
}

export function decimalToDate(decimal: Decimal | null): Date | null {
  if (!decimal) return null;
  const millis = decimal.toNumber();
  return new Date(millis);
}

export const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;
