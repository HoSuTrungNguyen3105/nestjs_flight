import { Role } from 'generated/prisma';

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  pictureUrl: string;
  rank: string;
  role: Role;
  createdAt: number;
  updatedAt: number;
  userAlias: string;
  authType: string;
  loginFailCnt: number;
  accountLockYn: string;
  mfaEnabledYn: string;
  mfaSecretKey?: string;
  isEmailVerified: string;
  prevPassword?: string;
  lastLoginDate?: number;
  transferAdminId?: number | null;
}
