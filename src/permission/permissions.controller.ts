import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

@Controller('auth/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @Get('role/all')
  async getAllPermissions() {
    console.log('rolr');
    return this.permissionsService.getPermissions();
  }

  @Get('type/all')
  async getAllPermissionsEnum() {
    console.log('rolr');
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
}
