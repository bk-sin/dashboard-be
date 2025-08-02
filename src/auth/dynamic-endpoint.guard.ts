import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { EndpointManagementService } from '../endpoint-management/endpoint-management.service';

@Injectable()
export class DynamicEndpointGuard implements CanActivate {
  constructor(private endpointManagementService: EndpointManagementService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as any;
    const { method, route } = request;

    // Si no hay ruta, permitir acceso (caso edge)
    if (!route?.path) {
      return true;
    }

    try {
      // Buscar el endpoint en la base de datos
      const endpoint =
        await this.endpointManagementService.getEndpointByPathAndMethod(
          route.path,
          method,
        );

      // Si el endpoint no está registrado, permitir acceso por defecto
      if (!endpoint) {
        return true;
      }

      // Verificar si el endpoint está activo
      if (!(endpoint as any).isActive) {
        return false;
      }

      // Si llegamos aquí, el endpoint está activo
      return true;
    } catch (error) {
      // En caso de error, permitir acceso por defecto
      console.error('Error checking endpoint status:', error);
      return true;
    }
  }
}
