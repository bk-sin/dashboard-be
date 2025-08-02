import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Unique permission name',
    example: 'users.read',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Allows reading user information',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Permission category',
    example: 'users',
  })
  @IsString()
  category: string;

  @ApiPropertyOptional({
    description: 'Whether the permission is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
