import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EndpointManagementService } from './endpoint-management.service';
import { UpdateEndpointPermissionsDto } from './dto/endpoint-management.dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Endpoint Management')
@ApiBearerAuth('jwt')
@Controller('endpoint-management')
export class EndpointManagementController {
  constructor(
    private readonly endpointManagementService: EndpointManagementService,
  ) {}

  @Get()
  @RequirePermissions('endpoints.read')
  @ApiOperation({ summary: 'Get all endpoints' })
  @ApiResponse({ status: 200, description: 'Return all endpoints' })
  findAll() {
    return this.endpointManagementService.findAll();
  }

  @Get('stats')
  @RequirePermissions('endpoints.read')
  @ApiOperation({ summary: 'Get endpoint statistics' })
  @ApiResponse({ status: 200, description: 'Return endpoint statistics' })
  getStats() {
    return this.endpointManagementService.getEndpointStats();
  }

  @Get('active')
  @RequirePermissions('endpoints.read')
  @ApiOperation({ summary: 'Get all active endpoints' })
  @ApiResponse({ status: 200, description: 'Return all active endpoints' })
  getActiveEndpoints() {
    return this.endpointManagementService.getActiveEndpoints();
  }

  @Get('controller/:controller')
  @RequirePermissions('endpoints.read')
  @ApiOperation({ summary: 'Get endpoints by controller' })
  @ApiParam({ name: 'controller', description: 'Controller name' })
  @ApiResponse({
    status: 200,
    description: 'Return endpoints for specific controller',
  })
  findByController(@Param('controller') controller: string) {
    return this.endpointManagementService.findByController(controller);
  }

  @Get(':id')
  @RequirePermissions('endpoints.read')
  @ApiOperation({ summary: 'Get endpoint by ID' })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiResponse({ status: 200, description: 'Return endpoint' })
  @ApiResponse({ status: 404, description: 'Endpoint not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.endpointManagementService.findOne(id);
  }

  @Patch(':id/permissions')
  @RequirePermissions('endpoints.update')
  @ApiOperation({ summary: 'Update endpoint permissions' })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiResponse({
    status: 200,
    description: 'Endpoint permissions updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Endpoint not found' })
  updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEndpointPermissionsDto,
  ) {
    return this.endpointManagementService.updateEndpointPermissions(
      id,
      updateDto.permissions,
    );
  }

  @Patch(':id/toggle-status')
  @RequirePermissions('endpoints.update')
  @ApiOperation({ summary: 'Toggle endpoint active status' })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiResponse({
    status: 200,
    description: 'Endpoint status toggled successfully',
  })
  @ApiResponse({ status: 404, description: 'Endpoint not found' })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.endpointManagementService.toggleEndpointStatus(id);
  }

  @Post('resync')
  @RequirePermissions('endpoints.manage')
  @ApiOperation({ summary: 'Resynchronize endpoints' })
  @ApiResponse({ status: 200, description: 'Endpoints synchronized' })
  resyncEndpoints() {
    return this.endpointManagementService.resyncEndpoints();
  }
}
