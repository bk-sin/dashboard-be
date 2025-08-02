import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EndpointsService } from '../endpoints/endpoints.service';
import { PERMISSIONS_KEY } from './decorators/permissions.decorator';

@Injectable()
export class DynamicPermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private endpointsService: EndpointsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = request.method as string;
    const route = request.route;
    const path: string = route?.path || request.url.split('?')[0];

    // Verificar si el endpoint está activo
    const isActive = await this.endpointsService.isEndpointActive(
      path,
      method.toUpperCase(),
    );
    if (!isActive) {
      throw new ForbiddenException('Endpoint is currently disabled');
    }

    // Obtener permisos requeridos del decorador
    const decoratorPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Obtener permisos dinámicos de la base de datos
    const dynamicPermissions =
      await this.endpointsService.getEndpointPermissions(
        path,
        method.toUpperCase(),
      );

    // Combinar permisos (prioridad a los dinámicos si existen)
    const requiredPermissions =
      dynamicPermissions.length > 0 ? dynamicPermissions : decoratorPermissions;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    interface RequestWithUser extends Request {
      user?: {
        role?: {
          permissions?: any;
        };
      };
    }

    const userRequest = request as RequestWithUser;
    const { user } = userRequest;

    if (!user?.role?.permissions) {
      throw new ForbiddenException('User does not have required permissions');
    }

    const userPermissions = user.role.permissions as string[];
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
