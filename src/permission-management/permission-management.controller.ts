import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PermissionManagementService } from './permission-management.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Permission Management')
@ApiBearerAuth('jwt')
@Controller('permission-management')
export class PermissionManagementController {
  constructor(
    private readonly permissionManagementService: PermissionManagementService,
  ) {}

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'Return all permissions' })
  findAll() {
    return this.permissionManagementService.findAll();
  }

  @Get('categories')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get permission categories' })
  @ApiResponse({ status: 200, description: 'Return permission categories' })
  getCategories() {
    return this.permissionManagementService.getPermissionCategories();
  }

  @Get('available')
  @RequirePermissions('roles.read')
  @ApiOperation({
    summary: 'Get all available permissions grouped by category',
  })
  @ApiResponse({
    status: 200,
    description: 'Return available permissions grouped by category',
  })
  getAvailablePermissions() {
    return this.permissionManagementService.getAllAvailablePermissions();
  }

  @Get('category/:category')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get permissions by category' })
  @ApiParam({ name: 'category', description: 'Permission category' })
  @ApiResponse({
    status: 200,
    description: 'Return permissions for specific category',
  })
  findByCategory(@Param('category') category: string) {
    return this.permissionManagementService.findByCategory(category);
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Return permission' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  findOne(@Param('id') id: string) {
    return this.permissionManagementService.findOne(+id);
  }
}
