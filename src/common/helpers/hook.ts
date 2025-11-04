import { Prisma, User } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { UserResponseDto } from 'src/users/dto/info-user-dto';
import { dateToDecimal } from './format';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SPECIALS = '!@#$%^&*()-_=+[]{}|;:,.<>?/';

export function generatePassword(allowSpecial = false) {
  const minLength = allowSpecial ? 8 : 10;
  const pool = LETTERS + DIGITS + (allowSpecial ? SPECIALS : '');

  const pick = (str: string) => str[crypto.randomInt(0, str.length)];

  const required = [
    pick(LETTERS),
    pick(DIGITS),
    ...(allowSpecial ? [pick(SPECIALS)] : []),
  ];

  const remainingLength = minLength - required.length;
  for (let i = 0; i < remainingLength; i++) {
    required.push(pick(pool));
  }

  for (let i = required.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [required[i], required[j]] = [required[j], required[i]];
  }

  return required.join('');
}

export function generateRandomInHotelCode(length = 10): string {
  const pool = LETTERS + DIGITS;
  const bytes = crypto.randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    result += pool[bytes[i] % pool.length];
  }

  return result;
}

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
  return Number(value) / 1000;
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
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
    createdAt: toEpochNumber(user.createdAt),
    updatedAt: toEpochNumber(user.updatedAt),
    lastLoginDate: user.lastLoginDate
      ? toEpochNumber(user.lastLoginDate)
      : undefined,
  };
};
