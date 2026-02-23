import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardLayout } from '@shared/components';
import { Auth } from '@core/services/auth.service';
import { ExpertService } from '@core/services/expert.service';
import { Proposal } from '@core/models/user.model';

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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, DashboardLayout]
})
export class Dashboard implements OnInit {
  private auth = inject(Auth);
  private expertService = inject(ExpertService);

  // Utilisateur connecté
  protected readonly currentUser = this.auth.getCurrentUser();

  protected readonly userName = computed(() => this.currentUser()?.firstName || '');
  protected readonly isUserLoaded = computed(() => this.currentUser() !== null);

  // Stats de profil (vues uniquement, le reste est supprimé du template)
  protected readonly dashboardStats = signal<DashboardStats>({
    profileViews: 0,
    profileViewsChange: '',
    revenue: 0,
    revenueChange: '',
    clients: 0,
    clientsChange: '',
    hoursWorked: 0,
    hoursWorkedChange: ''
  });

  // Quick stats
  protected readonly quickStats = signal({
    newMissions: 0,
    activeMissions: 0,
    averageRating: 0
  });

  // Propositions reçues (depuis Firebase)
  protected readonly proposals = signal<Proposal[]>([]);

  // Proposition en cours de traitement
  protected readonly processingId = signal<string | null>(null);

  // Nombre de propositions en attente
  protected readonly pendingCount = computed(() =>
    this.proposals().filter(p => p.status === 'pending').length
  );

  // Compteurs notifications/messages (simulés — à brancher sur Firebase plus tard)
  protected readonly unreadMessages = signal(0);
  protected readonly unreadNotifications = signal(0);

  // Missions récentes (données locales — missions acceptées simulées)
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

  async ngOnInit() {
    const user = this.currentUser();
    if (user && user.role === 'expert') {
      try {
        const props = await this.expertService.getProposalsForExpert(user.id);
        this.proposals.set(props);

        // Mettre à jour les stats
        const active = props.filter(p => p.status === 'accepted').length;
        this.quickStats.set({
          newMissions: props.filter(p => p.status === 'pending').length,
          activeMissions: active,
          averageRating: 0
        });
      } catch (e) {
        console.error('Erreur chargement propositions dashboard', e);
      }
    }
  }

  // Accepter une proposition
  protected async acceptProposal(proposal: Proposal): Promise<void> {
    if (!proposal.id || this.processingId()) return;
    try {
      this.processingId.set(proposal.id);
      await this.expertService.updateProposalStatus(proposal.id, 'accepted');
      this.proposals.update(list =>
        list.map(p => p.id === proposal.id ? { ...p, status: 'accepted' as const } : p)
      );
      // Recalculer les stats
      const active = this.proposals().filter(p => p.status === 'accepted').length;
      this.quickStats.update(s => ({ ...s, activeMissions: active }));
    } catch (e) {
      console.error('Erreur acceptation', e);
    } finally {
      this.processingId.set(null);
    }
  }

  // Refuser une proposition
  protected async rejectProposal(proposal: Proposal): Promise<void> {
    if (!proposal.id || this.processingId()) return;
    try {
      this.processingId.set(proposal.id);
      await this.expertService.updateProposalStatus(proposal.id, 'rejected');
      this.proposals.update(list =>
        list.map(p => p.id === proposal.id ? { ...p, status: 'rejected' as const } : p)
      );
    } catch (e) {
      console.error('Erreur refus', e);
    } finally {
      this.processingId.set(null);
    }
  }

  protected getMissionStatusClass(status: Mission['status']): string {
    switch (status) {
      case 'en-cours': return 'bg-primary/10 text-primary border border-primary/20';
      case 'en-attente': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'terminee': return 'bg-white/5 text-subtext border border-white/10';
      default: return 'bg-white/5 text-subtext border border-white/10';
    }
  }

  protected getMissionStatusText(status: Mission['status']): string {
    switch (status) {
      case 'en-cours': return 'En cours';
      case 'en-attente': return 'En attente';
      case 'terminee': return 'Terminée';
      default: return 'Inconnu';
    }
  }

  protected getMissionTimeText(mission: Mission): string {
    if (mission.status === 'en-cours' && mission.daysLeft) return `${mission.daysLeft} jours restants`;
    if (mission.status === 'en-attente' && mission.startDate) return `Démarre le ${mission.startDate}`;
    if (mission.status === 'terminee' && mission.completedDate) return mission.completedDate;
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
