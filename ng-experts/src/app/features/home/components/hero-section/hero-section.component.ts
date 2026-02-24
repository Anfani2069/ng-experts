import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class HeroSection implements OnInit, OnDestroy {
  private router = inject(Router);
  protected readonly searchQuery = signal('');

  // Pool d'avatars
  private avatarPool = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
    'https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10',
    'https://i.pravatar.cc/150?img=11',
    'https://i.pravatar.cc/150?img=12'
  ];

  protected visibleAvatars = signal<string[]>([
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5'
  ]);

  private intervalId: any;

  ngOnInit() {
    // Rotation des avatars toutes les 3 secondes
    this.intervalId = setInterval(() => {
      this.rotateAvatars();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private rotateAvatars() {
    const currentAvatars = [...this.visibleAvatars()];
    const availableAvatars = this.avatarPool.filter(avatar => !currentAvatars.includes(avatar));

    if (availableAvatars.length > 0) {
      // Remplacer un avatar aléatoire
      const randomIndex = Math.floor(Math.random() * currentAvatars.length);
      currentAvatars[randomIndex] = availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
      this.visibleAvatars.set(currentAvatars);
    }
  }

  protected onBrowseExperts(): void {
    this.router.navigate(['/experts']);
  }

  protected onHireExpert(): void {
    this.router.navigate(['/register'], { queryParams: { type: 'recruiter' } });
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
