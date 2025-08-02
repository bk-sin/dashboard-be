import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSIONS_KEY = 'require_permissions';

/**
 * Decorador para especificar qué permisos se requieren para acceder a un endpoint.
 * Se puede usar a nivel de controlador (aplica a todos los métodos) o a nivel de método específico.
 * Los permisos de método tienen prioridad sobre los del controlador.
 *
 * @param permissions - Array de nombres de permisos requeridos (se requiere AL MENOS UNO)
 *
 * @example
 * // En el controlador - aplica a todos los métodos
 * @RequirePermissions('users.read')
 * @Controller('users')
 * export class UsersController {}
 *
 * @example
 * // En un método específico
 * @RequirePermissions('users.create', 'admin.all')
 * @Post()
 * create() {}
 *
 * @example
 * // Múltiples permisos - el usuario necesita AL MENOS UNO
 * @RequirePermissions('users.write', 'users.admin', 'super.admin')
 * @Put(':id')
 * update() {}
 */
export const RequirePermissions = (...permissions: string[]) => {
  if (permissions.length === 0) {
    throw new Error(
      'RequirePermissions decorator requires at least one permission',
    );
  }

  return SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);
};
