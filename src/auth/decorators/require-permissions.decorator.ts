import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSIONS_KEY = 'require_permissions';

export const RequirePermissions = (...permissions: string[]) => {
  if (permissions.length === 0) {
    throw new Error(
      'RequirePermissions decorator requires at least one permission',
    );
  }

  return SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);
};
