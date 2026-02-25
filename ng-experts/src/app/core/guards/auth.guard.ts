import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@core/services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const user = await auth.waitForUser();

  if (user) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
