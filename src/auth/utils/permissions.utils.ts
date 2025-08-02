import { UserResponse } from 'src/users/users.service';

export function isSuperAdmin(user: { role?: { slug?: string } }): boolean {
  if (user?.role?.slug) {
    return SUPER_ADMIN_ROLE_SLUG === user.role.slug;
  }
  return false;
}

export function extractUserPermissions(
  fullUserData: UserResponse | null,
): string[] {
  const permissions: string[] = [];

  if (fullUserData?.role?.rolePermissions) {
    fullUserData.role.rolePermissions.forEach((rolePermission) => {
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

export const SUPER_ADMIN_ROLE_SLUG = 'superadmin';

export default {
  isSuperAdmin,
  extractUserPermissions,
  SUPER_ADMIN_ROLE_SLUG,
};
