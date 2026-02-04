import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
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
    // TODO: Implement navigation to expert application
    console.log('Apply as Expert clicked');
  }

  protected onHireExpert(): void {
    this.router.navigate(['/login']);
  }

  protected onNavigate(section: string): void {
    // TODO: Implement smooth scroll navigation
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
