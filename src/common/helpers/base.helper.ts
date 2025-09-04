import { Prisma } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';

export function responseSuccess<T>(
  data: T,
  message = 'Thành công',
  code = '00',
) {
  return {
    code,
    message,
    ...data,
  };
}

export function nowDecimal(): Prisma.Decimal {
  return new Prisma.Decimal(Date.now().toString());
}
export function dateToDecimal(date: Date): Decimal {
  return new Decimal(date.getTime());
}

export function decimalToDate(decimal: Decimal | null): Date | null {
  if (!decimal) return null;
  return new Date(decimal.toNumber());
}

export const TEN_DAYS = 10 * 24 * 60 * 60 * 1000; // 10 ngày (ms)

export function responseError(message = 'Đã xảy ra lỗi', code = '99') {
  return {
    code,
    message,
  };
}
