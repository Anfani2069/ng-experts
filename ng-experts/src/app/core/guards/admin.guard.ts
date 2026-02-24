import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@core/services/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Attendre que l'utilisateur soit chargé
  const user = await auth.waitForUser();

  if (user?.role === 'admin') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
