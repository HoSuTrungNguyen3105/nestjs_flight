import { Injectable } from '@nestjs/common';
import { PermissionDefinition, Role, RolePermission } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import {
  ADMIN_PERMISSIONS,
  MONITOR_PERMISSIONS,
  Permission,
} from 'src/common/constants/permissions';
import { nowDecimal } from 'src/common/helpers/format';
import { PrismaService } from 'src/prisma.service';
import { PermissionResponseDto } from './dto/permission.response';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Seed permission definitions from constants into database
   * This creates the available permissions that can be assigned to roles
   */
  async seedPermissionDefinitions() {
    try {
      const permissionEntries: Array<{
        key: string;
        category: string;
        action: string;
        description: string;
      }> = [];

      // Convert Permission object to database entries
      for (const [category, actions] of Object.entries(Permission)) {
        for (const [action, key] of Object.entries(actions)) {
          permissionEntries.push({
            key: key as string,
            category,
            action,
            description: `${action} permission for ${category}`,
          });
        }
      }

      // Upsert all permissions
      const results = await Promise.all(
        permissionEntries.map((perm) =>
          this.prisma.permissionDefinition.upsert({
            where: { key: perm.key },
            update: {
              category: perm.category,
              action: perm.action,
              description: perm.description,
              updatedAt: nowDecimal(),
            },
            create: {
              key: perm.key,
              category: perm.category,
              action: perm.action,
              description: perm.description,
              isActive: true,
              createdAt: nowDecimal(),
              updatedAt: nowDecimal(),
            },
          }),
        ),
      );

      return {
        resultCode: '00',
        resultMessage: 'Permission definitions seeded successfully',
        data: {
          count: results.length,
          permissions: results,
        },
      };
    } catch (error) {
      console.error('Seed permission definitions error:', error);
      throw error;
    }
  }

  /**
   * Get all permission definitions from database
   */
  // async getPermissionDefinitions(
  //   category?: string,
  //   isActive?: boolean,
  // ): Promise<BaseResponseDto<PermissionDefinition>> {
  //   try {
  //     const where: any = {};
  //     if (category) where.category = category;
  //     if (isActive !== undefined) where.isActive = isActive;

  //     const permissions = await this.prisma.permissionDefinition.findMany({
  //       where,
  //       orderBy: [{ category: 'asc' }, { action: 'asc' }],
  //     });

  //     return {
  //       resultCode: '00',
  //       resultMessage: 'Lấy danh sách permissions thành công!',
  //       list: permissions,
  //     };
  //   } catch (error) {
  //     console.error('Get permission definitions error:', error);
  //     return {
  //       resultCode: '99',
  //       resultMessage: 'Có lỗi xảy ra khi lấy danh sách permissions',
  //     };
  //   }
  // }

  /**
   * Add a new permission definition dynamically
   */
  async addPermissionDefinition(data: {
    key: string;
    category: string;
    action: string;
    description?: string;
  }) {
    try {
      const hasPermission = await this.prisma.permissionDefinition.findUnique({
        where: {
          key: data.key,
        },
      });

      if (hasPermission) {
        return {
          resultCode: '01',
          resultMessage: 'Permission key đã tồn tại!',
        };
      }
      const permission = await this.prisma.permissionDefinition.create({
        data: {
          key: data.key,
          category: data.category,
          action: data.action,
          description:
            data.description || `${data.action} for ${data.category}`,
          isActive: true,
          createdAt: nowDecimal(),
          updatedAt: nowDecimal(),
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Thêm permission mới thành công!',
        data: permission,
      };
    } catch (error) {
      console.error('Add permission definition error:', error);
    }
  }

  /**
   * Update permission definition
   */
  async updatePermissionDefinition(
    id: string,
    data: {
      category?: string;
      action?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    try {
      const permission = await this.prisma.permissionDefinition.update({
        where: { id },
        data: {
          ...data,
          updatedAt: nowDecimal(),
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Cập nhật permission thành công!',
        data: permission,
      };
    } catch (error) {
      console.error('Update permission definition error:', error);
      throw error;
    }
  }

  /**
   * Delete permission definition
   */
  async deletePermissionDefinition(id: string) {
    try {
      await this.prisma.permissionDefinition.delete({
        where: { id },
      });

      return {
        resultCode: '00',
        resultMessage: 'Xóa permission thành công!',
      };
    } catch (error) {
      console.error('Delete permission definition error:', error);
      throw error;
    }
  }

  /**
   * Seed role permissions from database permission definitions
   * This uses the dynamic permissions from database instead of hard-coded constants
   */
  async seedPermissionsFromDatabase(
    adminPermKeys?: string[],
    monitorPermKeys?: string[],
  ) {
    try {
      // Get all active permissions from database
      const allPermissions = await this.prisma.permissionDefinition.findMany({
        where: { isActive: true },
      });

      // If no custom keys provided, use defaults
      const adminKeys = adminPermKeys || allPermissions.map((p) => p.key); // Admin gets all permissions

      const monitorKeys =
        monitorPermKeys ||
        allPermissions.filter((p) => p.action === 'VIEW').map((p) => p.key); // Monitor gets only VIEW

      // Convert to Record<string, boolean>
      const adminPerms = adminKeys.reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<string, boolean>,
      );

      const monitorPerms = monitorKeys.reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<string, boolean>,
      );

      // Upsert role permissions
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
        resultMessage: 'Permissions seeded from database successfully',
        data: {
          adminPermissionsCount: Object.keys(adminPerms).length,
          monitorPermissionsCount: Object.keys(monitorPerms).length,
          totalAvailablePermissions: allPermissions.length,
        },
      };
    } catch (error) {
      console.error('Seed permissions from database error:', error);
      throw error;
    }
  }

  /**
   * Seed permissions for roles with custom permission sets (legacy method)
   * @param adminPerms - Optional custom permissions for ADMIN role (defaults to all permissions)
   * @param monitorPerms - Optional custom permissions for MONITOR role (defaults to VIEW-only permissions)
   */
  async seedPermissions(
    adminPerms?: Record<string, boolean>,
    monitorPerms?: Record<string, boolean>,
  ) {
    try {
      // Use provided permissions or convert default arrays to Record<string, boolean>
      const adminPermissions =
        adminPerms ||
        ADMIN_PERMISSIONS.reduce(
          (acc, perm) => ({ ...acc, [perm]: true }),
          {} as Record<string, boolean>,
        );

      const monitorPermissions =
        monitorPerms ||
        MONITOR_PERMISSIONS.reduce(
          (acc, perm) => ({ ...acc, [perm]: true }),
          {} as Record<string, boolean>,
        );

      await this.prisma.rolePermission.upsert({
        where: { role: Role.ADMIN },
        update: { permissions: adminPermissions, updatedAt: nowDecimal() },
        create: {
          role: Role.ADMIN,
          permissions: adminPermissions,
          createdAt: nowDecimal(),
          updatedAt: nowDecimal(),
        },
      });

      await this.prisma.rolePermission.upsert({
        where: { role: Role.MONITOR },
        update: { permissions: monitorPermissions, updatedAt: nowDecimal() },
        create: {
          role: Role.MONITOR,
          permissions: monitorPermissions,
          createdAt: nowDecimal(),
          updatedAt: nowDecimal(),
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Permissions seeded successfully',
        data: {
          adminPermissionsCount: Object.keys(adminPermissions).length,
          monitorPermissionsCount: Object.keys(monitorPermissions).length,
        },
      };
    } catch (error) {
      console.error('Seed permissions error:', error);
      throw error; // Re-throw for proper error handling in controller
    }
  }

  /**
   * Seed permissions with default values from constants
   * This is a convenience method for initial setup
   */
  async seedDefaultPermissions() {
    return this.seedPermissions();
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

  async getPermissionDefinitionByCategory(
    category?: string,
    isActive?: boolean,
  ): Promise<BaseResponseDto<PermissionResponseDto>> {
    try {
      const res = await this.prisma.permissionDefinition.findMany({
        where: {
          category,
          isActive,
        },
      });
      const list = res.map((e) => ({
        ...e, // phải là e, không phải res
        createdAt: Number(e.createdAt),
        updatedAt: Number(e.updatedAt),
      }));
      return {
        resultCode: '00',
        resultMessage: 'Lấy thông tin người dùng thành công!',
        list,
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

  async getPermissionsForRole(role: 'ADMIN' | 'MONITOR') {
    if (role === 'ADMIN') {
      console.log(role);
      const res = await this.prisma.rolePermission.findUnique({
        where: { role: Role.ADMIN },
        select: {
          permissions: true,
        },
      });
      console.log(res);
      return {
        resultCode: '00',
        resultMessage: 'Lấy thông tin thành công!',
        list: res,
      };
    } else if (role === 'MONITOR') {
      const res = await this.prisma.rolePermission.findUnique({
        where: { role: Role.MONITOR },
        select: {
          permissions: true,
        },
      });
      return {
        resultCode: '00',
        resultMessage: 'Lấy thông tin thành công!',
        list: res,
      };
    }
    // return [];
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

  async findPermissionDefinition() {
    return this.prisma.permissionDefinition.findMany({
      select: {
        category: true,
        action: true,
        description: true,
        isActive: true,
      },
    });
  }
}
