import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  host: { 'class': 'block' }
})
export class Navbar {
  protected readonly isScrolled = signal(false);

  constructor(private router: Router) {
    this.setupScrollListener();
  }

  private setupScrollListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 50);
      });
    }
  }

  protected onApplyAsExpert(): void {
    // Remonter en haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Naviguer vers la page d'inscription expert (register)
    this.router.navigate(['/register']);
  }

  protected onHireExpert(): void {
    // Remonter en haut de la page
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
