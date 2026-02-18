import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class HeroSection {
  private router = inject(Router);
  protected readonly searchQuery = signal('');

  protected onBrowseExperts(): void {
    this.router.navigate(['/experts']);
  }

  protected onHireExpert(): void {
    this.router.navigate(['/login']);
  }

  protected onSearch(): void {
    // TODO: Implement search functionality
    console.log('Search:', this.searchQuery());
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }
}
