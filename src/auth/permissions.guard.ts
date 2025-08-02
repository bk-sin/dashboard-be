import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REQUIRE_PERMISSIONS_KEY } from './decorators/require-permissions.decorator';
import { JwtPayload } from './auth.service';
import { UsersService } from '../users/users.service';
import {
  extractUserPermissions,
  isSuperAdmin,
} from './utils/permissions.utils';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      this.logger.debug(
        'No required permissions specified, skipping permissions check',
      );
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request');
      return false;
    }

    try {
      const fullUserData = await this.usersService.findOne(user.id);

      if (fullUserData?.role?.slug && isSuperAdmin(fullUserData)) {
        this.logger.debug(
          `User ${user.email} has superadmin permissions, granting full access`,
        );
        return true;
      }

      if (!fullUserData) {
        this.logger.warn(`User with ID ${user.id} not found in database`);
        return false;
      }

      if (!fullUserData.isActive) {
        this.logger.warn(`User ${user.email} is not active`);
        return false;
      }
      const userPermissions = extractUserPermissions(fullUserData);

      this.logger.debug(
        `Required permissions: ${requiredPermissions.join(', ')}`,
      );
      this.logger.debug(`User permissions: ${userPermissions.join(', ')}`);

      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasPermission) {
        this.logger.warn(
          `User ${user.email} lacks required permissions: ${requiredPermissions.join(', ')}`,
        );
      }

      return hasPermission;
    } catch (error) {
      this.logger.error(
        `Error checking permissions for user ${user.email}:`,
        error,
      );
      return false;
    }
  }
}
