import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
import { authGuard } from '@core/guards/auth.guard';
import { recruiterGuard } from '@core/guards/recruiter.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.Home)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.Register)
  },
  // Expert dashboard & profile (expert role)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.Dashboard)
  },
  {
    path: 'missions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/missions/missions.component').then(m => m.Missions)
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () => import('./features/messages/messages.component').then(m => m.Messages)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.Notifications)
  },
  {
    path: 'profile-edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile-edit/profile-edit.component').then(m => m.ProfileEdit)
  },
  // Recruiter routes
  {
    path: 'recruiter/dashboard',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./features/recruiter-dashboard/recruiter-dashboard.component').then(m => m.RecruiterDashboard)
  },
  {
    path: 'recruiter/profile-edit',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./features/recruiter-profile-edit/recruiter-profile-edit.component').then(m => m.RecruiterProfileEdit)
  },
  {
    path: 'recruiter/missions',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./features/recruiter-missions/recruiter-missions.component').then(m => m.RecruiterMissions)
  },
  // Admin routes
  {
    path: 'admin/dashboard',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboard)
  },
  // Public routes
  {
    path: 'profile/:id',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.Profile)
  },
  {
    path: 'expert/:id',
    loadComponent: () => import('./features/expert-details/expert-details.component').then(m => m.ExpertDetails)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
