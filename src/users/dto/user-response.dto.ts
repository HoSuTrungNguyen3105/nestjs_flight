import { EmployeeStatus, Role } from 'generated/prisma';
import { UserResponseDto } from './info-user-dto';

// export class UserResponseDto {
//   id: number;
//   employeeNo: string;
//   email: string;
//   name: string;
//   role: Role;
//   pictureUrl: string;
//   rank: string;
//   department: string;
//   position: string;
//   status: EmployeeStatus;
//   lastLoginDate: number;
//   mfaEnabledYn: string;
//   phone: string;
//   createdAt: number;
//   updatedAt: number;
// }

export interface BatchUpdateResult {
  userId: number;
  employeeNo?: string | null;
  message?: string;
}

export class PaginatedUserResponse {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
