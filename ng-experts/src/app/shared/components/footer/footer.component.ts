import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class Footer {
  protected readonly currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  protected onGetStarted(): void {
    // TODO: Implement navigation to get started flow
    console.log('Get Started clicked');
  }

  protected onApplyAsExpert(): void {
    // TODO: Implement navigation to expert application
    console.log('Apply as Expert clicked');
  }

  protected onHireExpert(): void {
    this.router.navigate(['/login']);
  }

  protected onNavigate(link: string): void {
    if (link === 'home') {
      this.router.navigate(['/']);
    } else if (link === 'experts') {
      // Scroll to experts section on home page
      const element = document.getElementById('experts');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (link === 'About') {
      // Scroll to about section
      const element = document.getElementById('About');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // TODO: Implement other navigation logic
      console.log(`Navigate to: ${link}`);
    }
  }

  protected onSocialClick(platform: string): void {
    // TODO: Implement social media navigation
    console.log(`Social click: ${platform}`);
  }
}
