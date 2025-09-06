import { Prisma, User } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { UserResponseDto } from 'src/users/dto/info-user-dto';
import { dateToDecimal } from './base.helper';
import * as bcrypt from 'bcrypt';

export function toEpochDecimal(): Prisma.Decimal {
  return new Prisma.Decimal(Date.now() / 1000);
}

export async function generateOtp(expireMinutes: number = 5) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expireAt = dateToDecimal(
    new Date(Date.now() + expireMinutes * 60 * 1000),
  );

  return { otp, hashedOtp, expireAt };
}

export const toEpochNumber = (value: Decimal | number): number => {
  return Number(value) / 1000; // từ ms → giây có dấu .
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10); // tạo salt
  const hashed = await bcrypt.hash(password, salt); // hash mật khẩu
  return hashed;
}

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
