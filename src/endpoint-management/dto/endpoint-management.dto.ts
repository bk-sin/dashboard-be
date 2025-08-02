import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEndpointPermissionsDto {
  @ApiProperty({
    description: 'Array of required permissions for this endpoint',
    example: ['users.read', 'dashboard.access'],
    isArray: true,
    type: String,
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class EndpointStatsDto {
  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 12 })
  active: number;

  @ApiProperty({ example: 3 })
  inactive: number;

  @ApiProperty({
    example: [
      { controller: 'UsersController', _count: { id: 4 } },
      { controller: 'RolesController', _count: { id: 7 } },
    ],
  })
  byController: Array<{
    controller: string;
    _count: { id: number };
  }>;
}
