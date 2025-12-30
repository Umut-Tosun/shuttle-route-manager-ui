import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    const isValid = isTokenValid(token);
    return isValid ? true : router.createUrlTree(['/login']);
  }

  return router.createUrlTree(['/login']);
};

// Token geçerlilik kontrolü fonksiyonu
function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // saniyeyi milisaniyeye çevir
    return Date.now() < exp;
  } catch {
    return false;
  }
}