import { Component, signal, inject, ChangeDetectorRef, afterNextRender, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class Navbar {
  private router = inject(Router);
  private auth = inject(Auth);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  protected readonly currentUser = this.auth.getCurrentUser();
  protected readonly isLoggedIn = signal(false); // Will be updated by effect/init if needed, but currentUser is reactive
  protected readonly dashboardRoute = signal('/dashboard');

  protected readonly isScrolled = signal(false);
  protected readonly mobileMenuOpen = signal(false);

  constructor() {
    afterNextRender(() => {
      const onScroll = () => {
        this.isScrolled.set(window.scrollY > 50);
        this.cdr.markForCheck();
      };

      window.addEventListener('scroll', onScroll, { passive: true });

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
      });
    });
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  protected onApplyAsExpert(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/register'], { queryParams: { type: 'expert' } });
  }

  protected onHireExpert(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/register'], { queryParams: { type: 'recruiter' } });
  }

  protected onLogin(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/login']);
  }

  protected onNavigateDashboard(): void {
    const user = this.currentUser();
    const route = user?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate([route]);
    this.mobileMenuOpen.set(false);
  }

  protected onNavigateHome(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/']);
  }

  protected onNavigate(section: string): void {
    const currentUrl = this.router.url;

    if (currentUrl === '/' || currentUrl === '') {
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      });
    }
  }
}
