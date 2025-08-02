import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from './decorators/permissions.decorator';
import { User, Role } from 'generated/prisma';

type UserWithRole = User & {
  role: Role;
};

interface AuthenticatedRequest extends Request {
  user: UserWithRole;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { user } = request;

    if (!user?.role?.permissions) {
      return false;
    }

    const permissions = user.role.permissions as Record<string, boolean>;

    return requiredPermissions.some(
      (permission) => permissions[permission] === true,
    );
  }
}
