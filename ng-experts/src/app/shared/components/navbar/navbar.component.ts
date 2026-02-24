import { Component, signal, inject, ChangeDetectorRef, afterNextRender, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [CommonModule]
})
export class Navbar {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  protected readonly isScrolled = signal(false);

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

  protected onNavigateHome(): void {
    // Remonter en haut et naviguer vers la page d'accueil
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/']);
  }

  protected onNavigate(section: string): void {
    // Vérifier si on est sur la page d'accueil
    const currentUrl = this.router.url;

    if (currentUrl === '/' || currentUrl === '') {
      // On est déjà sur la page d'accueil, scroll vers la section
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // On est sur une autre page, naviguer d'abord vers la page d'accueil
      this.router.navigate(['/']).then(() => {
        // Attendre que la page soit chargée puis scroller
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
