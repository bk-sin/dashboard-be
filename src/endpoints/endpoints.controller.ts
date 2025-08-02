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
import { EndpointsService } from './endpoints.service';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Endpoints')
@ApiBearerAuth('jwt')
@Controller('endpoints')
export class EndpointsController {
  constructor(private readonly endpointsService: EndpointsService) {}

  @Post()
  @RequirePermissions('endpoints.create')
  @ApiOperation({ summary: 'Create a new endpoint' })
  @ApiResponse({ status: 201, description: 'Endpoint created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createEndpointDto: CreateEndpointDto) {
    return this.endpointsService.create(createEndpointDto);
  }

  @Get()
  @RequirePermissions('endpoints.read')
  @ApiOperation({ summary: 'Get all endpoints' })
  @ApiResponse({ status: 200, description: 'Return all endpoints' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.endpointsService.findAll();
  }

  @Get('active')
  @RequirePermissions('endpoints.read')
  @ApiOperation({ summary: 'Get all active endpoints' })
  @ApiResponse({ status: 200, description: 'Return all active endpoints' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findActive() {
    return this.endpointsService.findActive();
  }

  @Get('controllers')
  @RequirePermissions('endpoints.read')
  @ApiOperation({ summary: 'Get all controllers' })
  @ApiResponse({ status: 200, description: 'Return all controllers' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getControllers() {
    return this.endpointsService.getControllers();
  }

  @Get('controller/:controller')
  @RequirePermissions('endpoints.read')
  @ApiOperation({ summary: 'Get endpoints by controller' })
  @ApiResponse({ status: 200, description: 'Return endpoints for controller' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByController(@Param('controller') controller: string) {
    return this.endpointsService.findByController(controller);
  }

  @Get(':id')
  @RequirePermissions('endpoints.read')
  @ApiOperation({ summary: 'Get an endpoint by id' })
  @ApiResponse({ status: 200, description: 'Return an endpoint' })
  @ApiResponse({ status: 404, description: 'Endpoint not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.endpointsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('endpoints.update')
  @ApiOperation({ summary: 'Update an endpoint' })
  @ApiResponse({ status: 200, description: 'Endpoint updated successfully' })
  @ApiResponse({ status: 404, description: 'Endpoint not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEndpointDto: UpdateEndpointDto,
  ) {
    return this.endpointsService.update(id, updateEndpointDto);
  }

  @Patch(':id/toggle-status')
  @RequirePermissions('endpoints.update')
  @ApiOperation({ summary: 'Toggle endpoint active status' })
  @ApiResponse({
    status: 200,
    description: 'Endpoint status toggled successfully',
  })
  @ApiResponse({ status: 404, description: 'Endpoint not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.endpointsService.toggleStatus(id);
  }

  @Patch(':id/permissions')
  @RequirePermissions('endpoints.update')
  @ApiOperation({ summary: 'Update endpoint permissions' })
  @ApiResponse({
    status: 200,
    description: 'Endpoint permissions updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Endpoint not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updatePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permissions: string[] },
  ) {
    return this.endpointsService.updatePermissions(id, body.permissions);
  }

  @Delete(':id')
  @RequirePermissions('endpoints.delete')
  @ApiOperation({ summary: 'Delete an endpoint' })
  @ApiResponse({ status: 200, description: 'Endpoint deleted successfully' })
  @ApiResponse({ status: 404, description: 'Endpoint not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.endpointsService.remove(id);
  }
}
