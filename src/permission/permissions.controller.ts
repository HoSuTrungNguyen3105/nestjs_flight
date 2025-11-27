import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
    body?: {
      adminPerms?: Record<string, boolean>;
      monitorPerms?: Record<string, boolean>;
    },
  ) {
    return this.permissionsService.seedPermissions(
      body?.adminPerms,
      body?.monitorPerms,
    );
  }

  @Post('seed-default')
  async seedDefaultPermissions() {
    return this.permissionsService.seedDefaultPermissions();
  }

  // ========== DYNAMIC PERMISSIONS FROM DATABASE ==========

  @Post('definitions/seed')
  async seedPermissionDefinitions() {
    return this.permissionsService.seedPermissionDefinitions();
  }

  @Post('definitions')
  async getPermissionDefinitions(
    @Body('category') category?: string,
    @Body('isActive') isActive?: string,
  ) {
    return this.permissionsService.getPermissionDefinitionByCategory(
      category,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Post('definitions')
  async addPermissionDefinition(
    @Body()
    data: {
      key: string;
      category: string;
      action: string;
      description?: string;
    },
  ) {
    return this.permissionsService.addPermissionDefinition(data);
  }

  @Post('definitions/:id')
  async updatePermissionDefinition(
    @Param('id') id: string,
    @Body()
    data: {
      category?: string;
      action?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.permissionsService.updatePermissionDefinition(id, data);
  }

  @Post('definitions/:id/delete')
  async deletePermissionDefinition(@Param('id') id: string) {
    return this.permissionsService.deletePermissionDefinition(id);
  }

  @Post('seed-from-database')
  async seedPermissionsFromDatabase(
    @Body()
    body?: {
      adminPermKeys?: string[];
      monitorPermKeys?: string[];
    },
  ) {
    return this.permissionsService.seedPermissionsFromDatabase(
      body?.adminPermKeys,
      body?.monitorPermKeys,
    );
  }

  // ========== LEGACY ENDPOINTS ==========

  @Get('type/enum')
  async getAllPermissionsEnum() {
    return this.permissionsService.getAllPermissions();
  }

  @Get('type/permission_definition')
  async findPermissionDefinition() {
    return this.permissionsService.findPermissionDefinition();
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
