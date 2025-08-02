import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@ApiTags('Permissions')
@ApiBearerAuth('jwt')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('permissions.create')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'Return all permissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('categories')
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Get all permission categories' })
  @ApiResponse({ status: 200, description: 'Return all categories' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCategories() {
    return this.permissionsService.getCategories();
  }

  @Get('category/:category')
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Get permissions by category' })
  @ApiResponse({ status: 200, description: 'Return permissions for category' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByCategory(@Param('category') category: string) {
    return this.permissionsService.findByCategory(category);
  }

  @Get(':id')
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Get a permission by id' })
  @ApiResponse({ status: 200, description: 'Return a permission' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('permissions.update')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Patch(':id/toggle-status')
  @RequirePermissions('permissions.update')
  @ApiOperation({ summary: 'Toggle permission active status' })
  @ApiResponse({
    status: 200,
    description: 'Permission status toggled successfully',
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.toggleStatus(id);
  }

  @Delete(':id')
  @RequirePermissions('permissions.delete')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.remove(id);
  }
}
