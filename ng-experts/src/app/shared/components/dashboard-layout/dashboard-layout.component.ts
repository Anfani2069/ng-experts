import { ChangeDetectionStrategy, Component, input, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@core/services/auth.service';

export interface NavigationItem {
  icon: string;
  label: string;
  isActive: boolean;
  badge?: number;
}

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule]
})
export class DashboardLayout implements OnInit {
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

  // État de chargement de l'utilisateur
  protected readonly isUserLoaded = computed(() => {
    return this.currentUser() !== null;
  });

  // Nom complet de l'utilisateur pour affichage
  protected readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  });

  // Rôle de l'utilisateur pour affichage
  protected readonly userRole = computed(() => {
    const user = this.currentUser();
    if (!user) return '';

    return user.role === 'expert' ? 'Expert Angular' : 'Recruteur';
  });

  // Avatar de l'utilisateur
  protected readonly userAvatar = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.userDisplayName()) + '&background=EC4899&color=fff';
  });

  // Nombre de notifications (à remplacer par des données réelles)
  protected readonly notificationCount = signal(0);

  // Données de navigation
  protected readonly navItems = signal<NavigationItem[]>([
    { icon: 'fa-solid fa-home', label: 'Dashboard', isActive: true },
    { icon: 'fa-solid fa-briefcase', label: 'Mes Missions', isActive: false },
    { icon: 'fa-solid fa-message', label: 'Messages', isActive: false },
    { icon: 'fa-solid fa-user-pen', label: 'Editer mon profil', isActive: false }
  ]);

  protected readonly settingsItems = signal<NavigationItem[]>([
    { icon: 'fa-solid fa-bell', label: 'Notifications', isActive: false }
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

  protected readonly isRecruiter = computed(() => this.currentUser()?.role === 'recruiter');

  protected navigateToSection(sectionLabel: string): void {
    const isRecruiter = this.isRecruiter();

    const routeMapping: { [key: string]: string } = isRecruiter ? {
      'Dashboard':        '/recruiter/dashboard',
      'Mes Missions':     '/recruiter/missions',
      'Messages':         '/messages',
      'Editer mon profil': '/recruiter/profile-edit',
      'Notifications':    '/notifications'
    } : {
      'Dashboard':        '/dashboard',
      'Mes Missions':     '/missions',
      'Messages':         '/messages',
      'Editer mon profil': '/profile-edit',
      'Notifications':    '/notifications'
    };

    const route = routeMapping[sectionLabel];
    if (route) {
      this.setActiveNavItem(sectionLabel);
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
  public ngOnInit(): void {
    const currentPath = window.location.pathname;
    if (currentPath.includes('dashboard')) {
      this.setActiveNavItem('Dashboard');
    } else if (currentPath.includes('profile-edit')) {
      this.setActiveNavItem('Editer mon profil');
    } else if (currentPath.includes('missions')) {
      this.setActiveNavItem('Mes Missions');
    } else if (currentPath.includes('messages')) {
      this.setActiveNavItem('Messages');
    } else if (currentPath.includes('notifications')) {
      this.setActiveNavItem('Notifications');
    }
  }
}
