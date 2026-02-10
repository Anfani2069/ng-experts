import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '@shared/components';
import { Footer } from '@shared/components';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ng-experts');
  
  private router = inject(Router);
  
  // Signal to track current route
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ),
    { initialValue: { url: this.router.url } as NavigationEnd }
  );
  
  // Computed to check if we should show navbar/footer - Sur pages publiques ET pages experts (pour recruteurs)
  protected readonly shouldShowNavigation = computed(() => {
    const url = this.currentUrl()?.url || this.router.url;
    // Afficher navbar/footer sur pages publiques + pages experts (pour recruteurs)
    return url === '/' || url.includes('/login') || url.includes('/register') || url.includes('/expert/');
  });
}
