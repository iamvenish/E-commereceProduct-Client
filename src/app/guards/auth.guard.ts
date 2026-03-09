import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthServices } from '../services/authServices/auth-services';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthServices);
  const router = inject(Router);

  return authService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
