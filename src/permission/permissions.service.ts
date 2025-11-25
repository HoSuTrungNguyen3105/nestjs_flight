import { Injectable } from '@nestjs/common';
import { Role, RolePermission } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import {
  ADMIN_PERMISSIONS,
  MONITOR_PERMISSIONS,
} from 'src/common/constants/permissions';
import { nowDecimal } from 'src/common/helpers/format';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

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

  //   async getPermissionsForRole(role: string) {
  //     const res = await this.prisma.rolePermission.findUnique({
  //       where: { role: role as Role },
  //     });

  //     return {
  //       resultCode: '00',
  //       resultMessage: 'Lấy thông tin thành công!',
  //       list: res,
  //     };
  //   }

  getAllPermissions() {
    return {
      resultCode: '00',
      resultMessage: 'Lấy thông tin thành công!',
      list: ADMIN_PERMISSIONS,
    };
  }

  // Get permissions for a specific role
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

  // Update permissions for a specific role
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
}
