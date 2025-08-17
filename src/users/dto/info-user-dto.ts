import { Role } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  pictureUrl: string;
  rank: string;
  role: Role;
  //   password: string;
  createdAt: Decimal; // ✅ giữ nguyên Decimal
  updatedAt: Decimal; // ✅ giữ nguyên Decimal
  userAlias: string;
  authType: string;
  loginFailCnt: number;
  accountLockYn: string;
  mfaEnabledYn: string;
  mfaSecretKey?: string | null; // ✅ cho phép null
  isEmailVerified: string;
  prevPassword: string;
  lastLoginDate?: number;
  transferAdminId?: number | null;
}
