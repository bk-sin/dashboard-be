import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REQUIRE_PERMISSIONS_KEY } from './decorators/require-permissions.decorator';
import { UserResponse, UserResponseWithPassword } from '../users/users.service';
import { isSuperAdmin } from './utils/permissions.utils';

interface AuthenticatedRequest extends Request {
  user: UserResponseWithPassword;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      this.logger.debug('No required permissions specified, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request');
      return false;
    }

    if (isSuperAdmin(user)) {
      this.logger.debug(`User ${user.email} is superadmin, granting access`);
      return true;
    }

    if (!user.isActive) {
      this.logger.warn(`User ${user.email} is not active`);
      return false;
    }

    const userPermissions = this.getUserPermissions(user);

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
  }

  private getUserPermissions(user: UserResponse): string[] {
    const permissions: string[] = [];

    if (user.role?.rolePermissions) {
      user.role.rolePermissions.forEach((rolePermission) => {
        if (
          rolePermission.isActive &&
          rolePermission.permission &&
          typeof rolePermission.permission.name === 'string'
        ) {
          permissions.push(rolePermission.permission.name);
        }
      });
    }
    return [...new Set(permissions)];
  }
}
