// src/common/utils/response.util.ts

import { Prisma, User } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { UserResponseDto } from 'src/users/dto/info-user-dto';

// export function formatUserResponse(user: User) {
//   return {
//     ...user,
//     createdAt: Number(user.createdAt),
//     updatedAt: Number(user.updatedAt),
//   };
// }

// export const toDecimalDateTime = (value: any): number => {
//   // Prisma.Decimal => number (epoch giây với phần thập phân)
//   const ms = Number(value);
//   return ms / 1000;
// };

export function toEpochDecimal(): Prisma.Decimal {
  return new Prisma.Decimal(Date.now() / 1000);
}

export const toEpochNumber = (value: Decimal | number): number => {
  return Number(value) / 1000; // từ ms → giây có dấu .
};

export const formatUserResponse = (user: User): UserResponseDto => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    pictureUrl: user.pictureUrl,
    rank: user.rank,
    role: user.role,
    userAlias: user.userAlias,
    authType: user.authType,
    loginFailCnt: user.loginFailCnt,
    accountLockYn: user.accountLockYn,
    mfaEnabledYn: user.mfaEnabledYn,
    mfaSecretKey: user.mfaSecretKey ?? undefined,
    isEmailVerified: user.isEmailVerified,
    prevPassword: user.prevPassword,
    createdAt: toEpochNumber(user.createdAt), // ✅ Decimal → number (có dấu .)
    updatedAt: toEpochNumber(user.updatedAt),
    lastLoginDate: user.lastLoginDate
      ? toEpochNumber(user.lastLoginDate)
      : undefined,
  };
};
