import { Module } from '@nestjs/common';
import { PermissionManagementService } from './permission-management.service';
import { PermissionManagementController } from './permission-management.controller';

@Module({
  controllers: [PermissionManagementController],
  providers: [PermissionManagementService],
  exports: [PermissionManagementService],
})
export class PermissionManagementModule {}
