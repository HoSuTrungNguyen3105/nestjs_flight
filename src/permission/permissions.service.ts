import { Injectable } from '@nestjs/common';
import { Role, RolePermission } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import {
  ADMIN_PERMISSIONS,
  MONITOR_PERMISSIONS,
  Permission,
} from 'src/common/constants/permissions';
import { nowDecimal } from 'src/common/helpers/format';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async seedPermissions(
    adminPerms: Record<string, boolean>,
    monitorPerms: Record<string, boolean>,
  ) {
    try {
      // Convert array to Record<string, boolean>
      // const adminPerms = ADMIN_PERMISSIONS.reduce(
      //   (acc, perm) => ({ ...acc, [perm]: [perm] }),
      //   {},
      // );
      // const monitorPerms = MONITOR_PERMISSIONS.reduce(
      //   (acc, perm) => ({ ...acc, [perm]: [perm] }),
      //   {},
      // );

      await this.prisma.rolePermission.upsert({
        where: { role: Role.ADMIN },
        update: { permissions: adminPerms, updatedAt: nowDecimal() },
        create: {
          role: Role.ADMIN,
          permissions: adminPerms,
          createdAt: nowDecimal(),
          updatedAt: nowDecimal(),
        },
      });

      await this.prisma.rolePermission.upsert({
        where: { role: Role.MONITOR },
        update: { permissions: monitorPerms, updatedAt: nowDecimal() },
        create: {
          role: Role.MONITOR,
          permissions: monitorPerms,
          createdAt: nowDecimal(),
          updatedAt: nowDecimal(),
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Permissions seeded successfully',
      };
    } catch (error) {
      console.error('Seed permissions error:', error);
      return {
        resultCode: '99',
        resultMessage: 'Failed to seed permissions',
      };
    }
  }

  async getPermissions(): Promise<BaseResponseDto<RolePermission>> {
    try {
      const res = await this.prisma.rolePermission.findMany();
      return {
        resultCode: '00',
        resultMessage: 'Lấy thông tin người dùng thành công!',
        list: res,
      };
    } catch (error) {
      console.error('error', error);
      return {
        resultCode: '99',
        resultMessage: 'Có lỗi xảy ra khi lấy thông tin người dùng',
      };
    }
  }

  getAllPermissions() {
    return {
      resultCode: '00',
      resultMessage: 'Lấy thông tin thành công!',
      data: Permission,
    };
  }

  getPermissionsForRole(role: 'ADMIN' | 'MONITOR') {
    if (role === 'ADMIN') {
      return {
        resultCode: '00',
        resultMessage: 'Lấy thông tin thành công!',
        list: ADMIN_PERMISSIONS,
      };
    } else if (role === 'MONITOR') {
      return {
        resultCode: '00',
        resultMessage: 'Lấy thông tin thành công!',
        list: MONITOR_PERMISSIONS,
      };
    }
    return [];
  }

  async updatePermissionsForRole(
    role: string,
    permissions: Record<string, boolean>,
  ) {
    return this.prisma.rolePermission.upsert({
      where: { role: role as Role },
      update: {
        permissions,
        updatedAt: nowDecimal(),
      },
      create: {
        role: role as Role,
        permissions,
        createdAt: nowDecimal(),
        updatedAt: 0,
      },
    });
  }

  // async setUserPermissions(
  //   userId: number | null,
  //   passengerId: string | null,
  //   permissions: Record<string, boolean>,
  // ) {
  //   if (!userId && !passengerId) {
  //     return {
  //       resultCode: '01',
  //       resultMessage: 'Phải có userId hoặc passengerId',
  //     };
  //   }

  //   try {
  //     if (userId) {
  //       await this.prisma.userPermission.upsert({
  //         where: { userId },
  //         update: {
  //           permissions,
  //           updatedAt: nowDecimal(),
  //         },
  //         create: {
  //           userId,
  //           permissions,
  //           createdAt: nowDecimal(),
  //           updatedAt: 0,
  //         },
  //       });
  //     } else if (passengerId) {
  //       await this.prisma.userPermission.upsert({
  //         where: { passengerId },
  //         update: {
  //           permissions,
  //           updatedAt: nowDecimal(),
  //         },
  //         create: {
  //           passengerId,
  //           permissions,
  //           createdAt: nowDecimal(),
  //           updatedAt: 0,
  //         },
  //       });
  //     }

  //     return {
  //       resultCode: '00',
  //       resultMessage: 'Cập nhật quyền thành công!',
  //     };
  //   } catch (error) {
  //     console.error('Lỗi cập nhật quyền user:', error);
  //     return {
  //       resultCode: '99',
  //       resultMessage: 'Lỗi hệ thống',
  //     };
  //   }
  // }

  // async getUserPermissions(userId: number | null, passengerId: string | null) {
  //   try {
  //     let userPerms: UserPermission | null = null;
  //     let role: Role | undefined;

  //     if (userId) {
  //       userPerms = await this.prisma.userPermission.findUnique({
  //         where: { userId },
  //       });
  //       const user = await this.prisma.user.findUnique({
  //         where: { id: userId },
  //         select: { role: true },
  //       });
  //       role = user?.role;
  //     } else if (passengerId) {
  //       userPerms = await this.prisma.userPermission.findUnique({
  //         where: { passengerId },
  //       });
  //       const passenger = await this.prisma.passenger.findUnique({
  //         where: { id: passengerId },
  //         select: { role: true },
  //       });
  //       role = passenger?.role;
  //     }

  //     // 1. Nếu có quyền riêng của user, trả về quyền đó
  //     if (userPerms) {
  //       return {
  //         resultCode: '00',
  //         resultMessage: 'Lấy quyền user thành công',
  //         permissions: userPerms.permissions,
  //         source: 'USER',
  //       };
  //     }

  //     // 2. Nếu không, lấy quyền theo Role
  //     if (role) {
  //       const rolePerms = await this.prisma.rolePermission.findUnique({
  //         where: { role },
  //       });
  //       return {
  //         resultCode: '00',
  //         resultMessage: 'Lấy quyền theo role thành công',
  //         permissions: rolePerms?.permissions || {},
  //         source: 'ROLE',
  //       };
  //     }

  //     return {
  //       resultCode: '01',
  //       resultMessage: 'Không tìm thấy quyền',
  //       permissions: {},
  //     };
  //   } catch (error) {
  //     console.error('Lỗi lấy quyền user:', error);
  //     return {
  //       resultCode: '99',
  //       resultMessage: 'Lỗi hệ thống',
  //     };
  //   }
  // }
}
