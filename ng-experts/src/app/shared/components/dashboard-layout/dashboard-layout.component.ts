import { ChangeDetectionStrategy, Component, input, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@core/services/auth.service';

export interface NavigationItem {
  icon: string;
  label: string;
  isActive: boolean;
  badge?: number;
}

export interface CurrentUser {
  name: string;
  role: string;
  avatar: string;
  email: string;
}

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule]
})
export class DashboardLayout {
  private auth = inject(Auth);
  private router = inject(Router);

  // Inputs for customization
  showSearch = input<boolean>(true);
  pageTitle = input<string>('');
  pageSubtitle = input<string>('');

  // User profile panel state
  protected readonly isProfilePanelOpen = signal(false);

  // Utilisateur connecté via Auth service
  protected readonly currentUser = this.auth.getCurrentUser();
  
  // Nom complet de l'utilisateur pour affichage
  protected readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';
  });
  
  // Rôle de l'utilisateur pour affichage
  protected readonly userRole = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Utilisateur';
    
    return user.role === 'expert' ? 'Expert Angular' : 'Recruteur';
  });

  // Avatar de l'utilisateur
  protected readonly userAvatar = computed(() => {
    const user = this.currentUser();
    return user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg';
  });

  // Données de navigation
  protected readonly navItems = signal<NavigationItem[]>([
    { icon: 'fa-solid fa-home', label: 'Dashboard', isActive: true },
    { icon: 'fa-solid fa-briefcase', label: 'Mes Missions', isActive: false },
    { icon: 'fa-solid fa-message', label: 'Messages', isActive: false, badge: 3 },
    { icon: 'fa-solid fa-user', label: 'Mon Profil', isActive: false }
  ]);

  protected readonly settingsItems = signal<NavigationItem[]>([
    { icon: 'fa-solid fa-bell', label: 'Notifications', isActive: false },
    { icon: 'fa-solid fa-gear', label: 'Paramètres', isActive: false }
  ]);

  // Methods
  protected toggleProfilePanel(): void {
    this.isProfilePanelOpen.update(isOpen => !isOpen);
  }

  protected closeProfilePanel(): void {
    this.isProfilePanelOpen.set(false);
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    this.closeProfilePanel();
  }

  protected navigateToProfile(): void {
    this.closeProfilePanel();
    this.router.navigate(['/profile-edit']);
  }

  protected navigateToSection(sectionLabel: string): void {
    // Mapping des labels vers les routes
    const routeMapping: { [key: string]: string } = {
      'Dashboard': '/dashboard',
      'Mes Missions': '/missions',
      'Messages': '/messages', 
      'Mon Profil': '/profile/1',
      'Notifications': '/notifications',
      'Paramètres': '/profile-edit'
    };

    const route = routeMapping[sectionLabel];
    if (route) {
      // Mettre à jour l'état actif
      this.setActiveNavItem(sectionLabel);
      // Naviguer vers la route
      this.router.navigate([route]);
    }
  }

  protected setActiveNavItem(activeLabel: string): void {
    this.navItems.update(items => 
      items.map(item => ({ 
        ...item, 
        isActive: item.label === activeLabel 
      }))
    );

    this.settingsItems.update(items => 
      items.map(item => ({ 
        ...item, 
        isActive: item.label === activeLabel 
      }))
    );
  }

  // Initialize active state based on current page
  ngOnInit(): void {
    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard')) {
      this.setActiveNavItem('Dashboard');
    } else if (currentPath.includes('profile-edit')) {
      this.setActiveNavItem('Mon Profil');
    }
  }
}
