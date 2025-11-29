import { Prisma, Role } from 'generated/prisma';

export class RolePermissionResponseDto {
  id: string;
  role: Role;
  permissions: Prisma.JsonValue;
  createdAt: number;
  updatedAt: number;
}
