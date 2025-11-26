import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

@Controller('auth/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @Get('role/all')
  async getAllPermissions() {
    return this.permissionsService.getPermissions();
  }

  @Post('seed')
  async seedPermissions(
    @Body()
    body: {
      adminPerms: Record<string, boolean>;
      monitorPerms: Record<string, boolean>;
    },
  ) {
    return this.permissionsService.seedPermissions(
      body.adminPerms,
      body.monitorPerms,
    );
  }

  @Get('type/enum')
  async getAllPermissionsEnum() {
    return this.permissionsService.getAllPermissions();
  }

  @Get('role/:role')
  async getPermissions(@Param('role') role: 'ADMIN' | 'MONITOR') {
    return this.permissionsService.getPermissionsForRole(role);
  }

  @Post('role/:role')
  async updatePermissions(
    @Param('role') role: string,
    @Body() permissions: Record<string, boolean>,
  ) {
    return this.permissionsService.updatePermissionsForRole(role, permissions);
  }

  // @Post('user')
  // async setUserPermissions(
  //   @Body()
  //   body: {
  //     userId?: number;
  //     passengerId?: string;
  //     permissions: Record<string, boolean>;
  //   },
  // ) {
  //   return this.permissionsService.setUserPermissions(
  //     body.userId || null,
  //     body.passengerId || null,
  //     body.permissions,
  //   );
  // }

  // @Get('user')
  // async getUserPermissions(
  //   @Body() body: { userId?: number; passengerId?: string },
  // ) {
  //   return this.permissionsService.getUserPermissions(
  //     body.userId || null,
  //     body.passengerId || null,
  //   );
  // }
}
