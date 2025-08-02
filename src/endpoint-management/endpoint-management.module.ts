import { Module } from '@nestjs/common';
import { EndpointManagementService } from './endpoint-management.service';
import { EndpointManagementController } from './endpoint-management.controller';

@Module({
  controllers: [EndpointManagementController],
  providers: [EndpointManagementService],
  exports: [EndpointManagementService],
})
export class EndpointManagementModule {}
