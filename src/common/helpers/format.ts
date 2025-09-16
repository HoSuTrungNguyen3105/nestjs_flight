import { Prisma } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';

// export function responseSuccess<T>(
//   data: T,
//   list: T[],
//   resultMessage: string,
//   resultCode: string | number,
// ) {
//   return {
//     code: resultCode,
//     message: resultMessage,
//     data,
//     list,
//   };
// }

// export function responseError(message = 'Đã xảy ra lỗi', code = '99') {
//   return {
//     code,
//     message,
//   };
// }
// utils/decimalUtils.ts

export class DecimalUtils {
  // Chuyển đổi Date thành Decimal (timestamp)
  static dateToDecimal(date: Date): Prisma.Decimal {
    return new Prisma.Decimal(date.getTime());
  }

  // Chuyển đổi Decimal thành Date
  static decimalToDate(decimal: Prisma.Decimal): Date {
    return new Date(decimal.toNumber());
  }

  // Kiểm tra xem một timestamp Decimal có nằm trong khoảng không
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

  // Tính số ngày giữa hai timestamp Decimal
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
  return new Date(decimal.toNumber());
}

export const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;
