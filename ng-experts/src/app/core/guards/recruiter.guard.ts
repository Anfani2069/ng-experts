import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@core/services/auth.service';

export const recruiterGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const user = await auth.waitForUser();

  if (user?.role === 'recruiter') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
