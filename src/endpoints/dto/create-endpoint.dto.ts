import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEndpointDto {
  @ApiProperty({
    description: 'Endpoint path',
    example: '/users/:id',
  })
  @IsString()
  path: string;

  @ApiProperty({
    description: 'HTTP method',
    example: 'GET',
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
  @IsString()
  method: string;

  @ApiProperty({
    description: 'Controller name',
    example: 'UsersController',
  })
  @IsString()
  controller: string;

  @ApiProperty({
    description: 'Controller action/method name',
    example: 'findOne',
  })
  @IsString()
  action: string;

  @ApiPropertyOptional({
    description: 'Endpoint description',
    example: 'Get user by ID',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the endpoint is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Required permissions for this endpoint',
    example: ['users.read'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
