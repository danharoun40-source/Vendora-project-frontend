import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (!allowedRoles.includes(auth.role() ?? '')) {
      router.navigate([auth.homeRouteForRole()]);
      return false;
    }

    return true;
  };
};
