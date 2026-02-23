import { Routes } from '@angular/router';

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
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.Dashboard)
  },
  {
    path: 'recruiter/dashboard',
    loadComponent: () => import('./features/recruiter-dashboard/recruiter-dashboard.component').then(m => m.RecruiterDashboard)
  },
  {
    path: 'recruiter/profile-edit',
    loadComponent: () => import('./features/recruiter-profile-edit/recruiter-profile-edit.component').then(m => m.RecruiterProfileEdit)
  },
  {
    path: 'recruiter/missions',
    loadComponent: () => import('./features/recruiter-missions/recruiter-missions.component').then(m => m.RecruiterMissions)
  },
  {
    path: 'missions',
    loadComponent: () => import('./features/missions/missions.component').then(m => m.Missions)
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/messages.component').then(m => m.Messages)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.Notifications)
  },
  {
    path: 'profile-edit',
    loadComponent: () => import('./features/profile-edit/profile-edit.component').then(m => m.ProfileEdit)
  },
  {
    path: 'profile-test',
    loadComponent: () => import('./features/profile-test/profile-test.component').then(m => m.ProfileTest)
  },
  {
    path: 'test-firebase',
    loadComponent: () => import('./features/test/firebase-test.component').then(m => m.FirebaseTest)
  },
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
