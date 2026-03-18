import { Component, input, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { LanguageService } from '@core/services/language.service';

export interface NavigationItem {
  icon: string;
  key: string;
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
  protected readonly lang = inject(LanguageService);

  showSearch = input<boolean>(true);
  pageTitle = input<string>('');
  pageSubtitle = input<string>('');

  protected readonly isProfilePanelOpen = signal(false);
  protected readonly isSidebarOpen = signal(false);
  protected readonly currentUser = this.auth.getCurrentUser();


  protected readonly isUserLoaded = computed(() => this.currentUser() !== null);

  protected readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  protected readonly userRole = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return user.role === 'expert'
      ? this.lang.t('dashboardLayout.expertRole')
      : user.role === 'recruiter'
      ? this.lang.t('dashboardLayout.recruiterRole')
      : '';
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

  private readonly _activeKey = signal<string>('dashboard');

  protected readonly navItems = computed<NavigationItem[]>(() => [
    { icon: 'fa-solid fa-home', key: 'dashboard', label: this.lang.t('dashboardLayout.dashboard'), isActive: this._activeKey() === 'dashboard' },
    { icon: 'fa-solid fa-briefcase', key: 'missions', label: this.lang.t('dashboardLayout.missions'), isActive: this._activeKey() === 'missions' },
    { icon: 'fa-solid fa-message', key: 'messages', label: this.lang.t('dashboardLayout.messages'), isActive: this._activeKey() === 'messages' },
    { icon: 'fa-solid fa-user-pen', key: 'editProfile', label: this.lang.t('dashboardLayout.editProfile'), isActive: this._activeKey() === 'editProfile' }
  ]);

  protected readonly settingsItems = computed<NavigationItem[]>(() => [
    { icon: 'fa-solid fa-bell', key: 'notifications', label: this.lang.t('dashboardLayout.notifications'), isActive: this._activeKey() === 'notifications' }
  ]);

  ngOnInit(): void {
    const path = window.location.pathname;
    if (path.includes('profile-edit')) this._activeKey.set('editProfile');
    else if (path.includes('missions')) this._activeKey.set('missions');
    else if (path.includes('messages')) this._activeKey.set('messages');
    else if (path.includes('notifications')) this._activeKey.set('notifications');
    else if (path.includes('dashboard')) this._activeKey.set('dashboard');
  }

  protected navigateToSection(key: string): void {
    const routeMapping: Record<string, string> = this.isAdmin() ? {
      dashboard: '/admin/dashboard',
      missions: '/admin/dashboard',
      messages: '/messages',
      editProfile: '/admin/dashboard',
      notifications: '/notifications'
    } : this.isRecruiter() ? {
      dashboard: '/recruiter/dashboard',
      missions: '/recruiter/missions',
      messages: '/messages',
      editProfile: '/recruiter/profile-edit',
      notifications: '/notifications'
    } : {
      dashboard: '/dashboard',
      missions: '/missions',
      messages: '/messages',
      editProfile: '/profile-edit',
      notifications: '/notifications'
    };
    const route = routeMapping[key];
    if (route) {
      this._activeKey.set(key);
      this.isSidebarOpen.set(false);
      this.router.navigate([route]);
    }
  }

  protected toggleProfilePanel(): void {
    this.isProfilePanelOpen.update(v => !v);
  }

  protected toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  protected closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  protected closeProfilePanel(): void {
    this.isProfilePanelOpen.set(false);
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    this.closeProfilePanel();
  }
}
