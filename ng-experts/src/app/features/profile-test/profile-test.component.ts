import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-test',
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold text-green-600">✅ Profile Test Component Fonctionne !</h1>
      <p class="mt-4">Si vous voyez cette page, la navigation fonctionne parfaitement.</p>
      <p class="mt-2 text-gray-600">URL actuelle: {{ currentUrl }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ProfileTest {
  protected readonly currentUrl = window.location.pathname;
}
