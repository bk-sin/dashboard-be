import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Permission name', example: 'users.read' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Permission description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Permission category', example: 'users' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: 'Permission icon', example: 'fa-users' })
  @IsString()
  @IsOptional()
  permissionIcon?: string;

  @ApiPropertyOptional({ description: 'Is permission active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
