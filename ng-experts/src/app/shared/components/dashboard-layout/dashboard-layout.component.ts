import { Component, input, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

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
  imports: [CommonModule, RouterModule]
})
export class DashboardLayout implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  protected readonly notifService = inject(NotificationService);

  showSearch = input<boolean>(true);
  pageTitle = input<string>('');
  pageSubtitle = input<string>('');

  protected readonly isProfilePanelOpen = signal(false);
  protected readonly currentUser = this.auth.getCurrentUser();

  protected readonly isUserLoaded = computed(() => this.currentUser() !== null);

  protected readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  protected readonly userRole = computed(() => {
    const user = this.currentUser();
    return user?.role === 'expert' ? 'Expert Angular' : user?.role === 'recruiter' ? 'Recruteur' : '';
  });

  protected readonly userAvatar = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userDisplayName())}&background=EC4899&color=fff`;
  });

  protected readonly notificationCount = computed(() => this.notifService.unreadNotifications());
  protected readonly unreadMessagesCount = computed(() => this.notifService.unreadMessages());
  protected readonly isRecruiter = computed(() => this.currentUser()?.role === 'recruiter');
  protected readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  protected readonly navItems = signal<NavigationItem[]>([
    { icon: 'fa-solid fa-home',     label: 'Dashboard',         isActive: false },
    { icon: 'fa-solid fa-briefcase',label: 'Mes Missions',      isActive: false },
    { icon: 'fa-solid fa-message',  label: 'Messages',          isActive: false },
    { icon: 'fa-solid fa-user-pen', label: 'Editer mon profil', isActive: false }
  ]);

  protected readonly settingsItems = signal<NavigationItem[]>([
    { icon: 'fa-solid fa-bell', label: 'Notifications', isActive: false }
  ]);

  ngOnInit(): void {
    const path = window.location.pathname;
    if      (path.includes('profile-edit'))   this.setActiveNavItem('Editer mon profil');
    else if (path.includes('missions'))       this.setActiveNavItem('Mes Missions');
    else if (path.includes('messages'))       this.setActiveNavItem('Messages');
    else if (path.includes('notifications'))  this.setActiveNavItem('Notifications');
    else if (path.includes('dashboard'))      this.setActiveNavItem('Dashboard');
  }

  protected setActiveNavItem(activeLabel: string): void {
    this.navItems.update(items => items.map(item => ({ ...item, isActive: item.label === activeLabel })));
    this.settingsItems.update(items => items.map(item => ({ ...item, isActive: item.label === activeLabel })));
  }

  protected navigateToSection(sectionLabel: string): void {
    const routeMapping: Record<string, string> = this.isAdmin() ? {
      'Dashboard':         '/admin/dashboard',
      'Mes Missions':      '/admin/dashboard',
      'Messages':          '/messages',
      'Editer mon profil': '/admin/dashboard',
      'Notifications':     '/notifications'
    } : this.isRecruiter() ? {
      'Dashboard':         '/recruiter/dashboard',
      'Mes Missions':      '/recruiter/missions',
      'Messages':          '/messages',
      'Editer mon profil': '/recruiter/profile-edit',
      'Notifications':     '/notifications'
    } : {
      'Dashboard':         '/dashboard',
      'Mes Missions':      '/missions',
      'Messages':          '/messages',
      'Editer mon profil': '/profile-edit',
      'Notifications':     '/notifications'
    };
    const route = routeMapping[sectionLabel];
    if (route) {
      this.setActiveNavItem(sectionLabel);
      this.router.navigate([route]);
    }
  }

  protected toggleProfilePanel(): void {
    this.isProfilePanelOpen.update(v => !v);
  }

  protected closeProfilePanel(): void {
    this.isProfilePanelOpen.set(false);
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    this.closeProfilePanel();
  }
}
