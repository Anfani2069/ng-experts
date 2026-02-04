import { ChangeDetectionStrategy, Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  styleUrl: './dashboard-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule]
})
export class DashboardLayout {
  
  // Inputs for customization
  pageTitle = input<string>('');
  pageSubtitle = input<string>('');
  showSearch = input<boolean>(true);
  
  // Navigation items
  protected readonly navItems = signal<NavigationItem[]>([
    { icon: 'fa-solid fa-home', label: 'Dashboard', isActive: false },
    { icon: 'fa-solid fa-briefcase', label: 'Mes Missions', isActive: false },
    { icon: 'fa-solid fa-message', label: 'Messages', isActive: false, badge: 3 },
    { icon: 'fa-solid fa-user', label: 'Mon Profil', isActive: false }
  ]);

  protected readonly settingsItems = signal<NavigationItem[]>([
    { icon: 'fa-solid fa-bell', label: 'Notifications', isActive: false },
    { icon: 'fa-solid fa-gear', label: 'Paramètres', isActive: false }
  ]);

  // Current user info
  protected readonly currentUser = signal<CurrentUser>({
    name: 'Jean Dupont',
    role: 'Développeur Angular',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    email: 'jean.dupont@ng-expert.com'
  });

  // User profile panel state
  protected readonly isProfilePanelOpen = signal(false);

  // Methods
  protected toggleProfilePanel(): void {
    this.isProfilePanelOpen.update(isOpen => !isOpen);
  }

  protected closeProfilePanel(): void {
    this.isProfilePanelOpen.set(false);
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
