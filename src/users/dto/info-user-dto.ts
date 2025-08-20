import { Role } from 'generated/prisma';

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  pictureUrl: string;
  rank: string;
  role: Role;
  //   password: string;
  createdAt: number; // ✅ number thay vì Decimal
  updatedAt: number; // ✅ number thay vì Decimal
  userAlias: string;
  authType: string;
  loginFailCnt: number;
  accountLockYn: string;
  mfaEnabledYn: string;
  mfaSecretKey?: string | null; // ✅ cho phép null
  isEmailVerified: string;
  prevPassword?: string;
  lastLoginDate?: number;
  transferAdminId?: number | null;
}
