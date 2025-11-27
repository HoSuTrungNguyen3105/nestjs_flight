import { Prisma } from 'generated/prisma';

export class PermissionResponseDto {
  id: string;
  key: string;
  category: string;
  action: string;
  description: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
