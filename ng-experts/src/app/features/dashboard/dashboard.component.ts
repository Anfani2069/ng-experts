import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardLayout } from '@shared/components';
import { Auth } from '@core/services/auth.service';
import { ExpertService } from '@core/services/expert.service';

export interface DashboardStats {
  profileViews: number;
  profileViewsChange: string;
  revenue: number;
  revenueChange: string;
  clients: number;
  clientsChange: string;
  hoursWorked: number;
  hoursWorkedChange: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'en-cours' | 'en-attente' | 'terminee';
  daysLeft?: number;
  startDate?: string;
  completedDate?: string;
  budget: number;
  icon: string;
  iconColor: string;
}

export interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  timeAgo: string;
  isUnread: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, DashboardLayout]
})
export class Dashboard {
  private auth = inject(Auth);

  // Utilisateur connecté
  protected readonly currentUser = this.auth.getCurrentUser();

  // Nom d'utilisateur pour affichage
  protected readonly userName = computed(() => {
    const user = this.currentUser();
    return user ? user.firstName : 'Expert';
  });

  // Profile completion signal
  protected readonly profileCompletion = signal(85);

  // Dashboard stats
  protected readonly dashboardStats = signal<DashboardStats>({
    profileViews: 1248,
    profileViewsChange: '+12.5%',
    revenue: 12500,
    revenueChange: '+8.2%',
    clients: 45,
    clientsChange: '+23%',
    hoursWorked: 156,
    hoursWorkedChange: '--'
  });

  // Quick stats for welcome card
  protected readonly quickStats = signal({
    newMissions: 12,
    activeMissions: 3,
    averageRating: 4.9
  });

  // Skills data
  protected readonly skills = signal([
    { name: 'Angular', percentage: 92, color: 'bg-primary' },
    { name: 'TypeScript', percentage: 88, color: 'bg-cyan-400' },
    { name: 'RxJS', percentage: 75, color: 'bg-purple-400' },
    { name: 'NgRx', percentage: 68, color: 'bg-green-400' }
  ]);

  // Recent missions
  protected readonly recentMissions = signal<Mission[]>([
    {
      id: '1',
      title: 'Refonte application e-commerce',
      description: 'Migration Angular 15 vers 17',
      status: 'en-cours',
      daysLeft: 3,
      budget: 2500,
      icon: 'fa-solid fa-code',
      iconColor: 'text-primary'
    },
    {
      id: '2',
      title: 'Application mobile RH',
      description: 'Développement Ionic + Angular',
      status: 'en-attente',
      startDate: '15 fév',
      budget: 4200,
      icon: 'fa-solid fa-mobile',
      iconColor: 'text-purple-600'
    },
    {
      id: '3',
      title: 'Dashboard analytics',
      description: 'Intégration Chart.js + RxJS',
      status: 'terminee',
      completedDate: 'Il y a 2 jours',
      budget: 1800,
      icon: 'fa-solid fa-chart-line',
      iconColor: 'text-green-600'
    }
  ]);

  // Recent messages
  protected readonly recentMessages = signal<Message[]>([
    {
      id: '1',
      senderName: 'Marie Dubois',
      senderAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      message: 'Bonjour, j\'aimerais discuter du projet Angular...',
      timeAgo: 'Il y a 2h',
      isUnread: true
    },
    {
      id: '2',
      senderName: 'Thomas Martin',
      senderAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      message: 'Merci pour votre travail sur le dashboard !',
      timeAgo: 'Hier',
      isUnread: false
    },
    {
      id: '3',
      senderName: 'Sophie Laurent',
      senderAvatar: 'https://randomuser.me/api/portraits/women/46.jpg',
      message: 'Pouvez-vous m\'envoyer le devis pour la migration ?',
      timeAgo: '2 jours',
      isUnread: false
    }
  ]);

  // Proposals
  protected readonly proposals = signal<import('@core/models/user.model').Proposal[]>([]);
  private expertService = inject(ExpertService);

  async ngOnInit() {
    // Charger les propositions si c'est un expert
    const user = this.currentUser();
    if (user && user.role === 'expert') {
      const proposals = await this.expertService.getProposalsForExpert(user.id);
      this.proposals.set(proposals);
    }
  }

  // Revenue chart data (simplified for display)
  protected readonly revenueData = signal([45, 60, 55, 75, 85, 100]);
  protected readonly chartMonths = signal(['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']);

  // Methods

  protected getMissionStatusClass(status: Mission['status']): string {
    switch (status) {
      case 'en-cours':
        return 'bg-green-50 text-green-600';
      case 'en-attente':
        return 'bg-yellow-50 text-yellow-600';
      case 'terminee':
        return 'bg-gray-50 text-gray-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  }

  protected getMissionStatusText(status: Mission['status']): string {
    switch (status) {
      case 'en-cours':
        return 'En cours';
      case 'en-attente':
        return 'En attente';
      case 'terminee':
        return 'Terminée';
      default:
        return 'Inconnu';
    }
  }

  protected getMissionTimeText(mission: Mission): string {
    if (mission.status === 'en-cours' && mission.daysLeft) {
      return `${mission.daysLeft} jours restants`;
    }
    if (mission.status === 'en-attente' && mission.startDate) {
      return `Démarre le ${mission.startDate}`;
    }
    if (mission.status === 'terminee' && mission.completedDate) {
      return mission.completedDate;
    }
    return '';
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  protected formatNumber(num: number): string {
    return new Intl.NumberFormat('fr-FR').format(num);
  }
}
