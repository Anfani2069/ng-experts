import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  computed,
  OnInit
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardLayout } from '@shared/components/dashboard-layout/dashboard-layout.component';
import { Auth } from '@core/services/auth.service';
import { ExpertService } from '@core/services/expert.service';
import { MessagingService } from '@core/services/messaging.service';
import { Proposal } from '@core/models/user.model';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firebase } from '@core/config/firebase.config';

export interface ProposalWithExpert extends Proposal {
  expertName?: string;
  expertAvatar?: string;
  expertSkills?: string[];
  expertCity?: string;
}

@Component({
  selector: 'app-recruiter-missions',
  templateUrl: './recruiter-missions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardLayout, DatePipe, RouterModule]
})
export class RecruiterMissions implements OnInit {
  private auth = inject(Auth);
  private expertService = inject(ExpertService);
  private router = inject(Router);
  private messaging = inject(MessagingService);

  protected readonly currentUser = this.auth.getCurrentUser();

  // State
  protected readonly isLoading = signal(true);
  protected readonly activeFilter = signal<'all' | 'pending' | 'accepted' | 'completed' | 'rejected' | 'expired'>('all');
  protected readonly allProposals = signal<ProposalWithExpert[]>([]);
  protected readonly selectedProposal = signal<ProposalWithExpert | null>(null);

  // Stats
  protected readonly stats = computed(() => {
    const p = this.allProposals();
    return {
      total: p.length,
      pending: p.filter(x => x.status === 'pending').length,
      accepted: p.filter(x => x.status === 'accepted').length,
      completed: p.filter(x => x.status === 'completed').length,
      rejected: p.filter(x => x.status === 'rejected').length,
      expired: p.filter(x => x.status === 'expired').length,
    };
  });

  // Propositions filtrées
  protected readonly filteredProposals = computed(() => {
    const filter = this.activeFilter();
    const proposals = this.allProposals();
    if (filter === 'all') return proposals;
    return proposals.filter(p => p.status === filter);
  });

  async ngOnInit() {
    await this.loadProposals();
  }

  private async loadProposals(): Promise<void> {
    const user = this.currentUser();
    if (!user) {
      this.isLoading.set(false);
      return;
    }

    try {
      this.isLoading.set(true);

      // Récupérer toutes les propositions du recruteur
      const q = query(
        collection(firebase.firestore, 'proposals'),
        where('clientId', '==', user.id)
      );
      const snap = await getDocs(q);
      const raw: Proposal[] = [];
      snap.forEach(d => raw.push({ id: d.id, ...d.data() } as Proposal));

      // Trier par date décroissante
      raw.sort((a, b) => {
        const da = this.toDate(a.createdAt)?.getTime() ?? 0;
        const db = this.toDate(b.createdAt)?.getTime() ?? 0;
        return db - da;
      });

      // Enrichir avec les infos des experts
      const enriched: ProposalWithExpert[] = await Promise.all(
        raw.map(async (p) => {
          try {
            const expert = await this.expertService.getExpertById(p.expertId);
            if (expert) {
              return {
                ...p,
                expertName: `${expert.firstName} ${expert.lastName}`,
                expertAvatar: expert.avatar,
                expertSkills: expert.skills?.slice(0, 3).map(s => s.name) ?? [],
                expertCity: expert.city
              };
            }
          } catch (_) {}
          return { ...p };
        })
      );

      this.allProposals.set(enriched);
    } catch (e) {
      console.error('Erreur chargement missions recruteur', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected openDetails(proposal: ProposalWithExpert): void {
    this.selectedProposal.set(proposal);
  }

  protected closeDetails(): void {
    this.selectedProposal.set(null);
  }

  protected viewExpert(expertId: string): void {
    this.closeDetails();
    this.router.navigate(['/expert', expertId]);
  }

  protected async contactExpert(proposal: ProposalWithExpert): Promise<void> {
    const user = this.currentUser();
    if (!user) return;
    try {
      await this.messaging.getOrCreateConversation(
        user.id,
        proposal.expertId,
        { name: `${user.firstName} ${user.lastName}`, avatar: user.avatar, role: 'recruiter' },
        { name: proposal.expertName || 'Expert', avatar: proposal.expertAvatar, role: 'expert' },
        proposal.id,
        proposal.title
      );
      this.closeDetails();
      this.router.navigate(['/messages']);
    } catch (e) {
      console.error('Erreur contact expert:', e);
    }
  }

  protected getStatusClass(status: Proposal['status']): string {
    switch (status) {
      case 'pending':   return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'accepted':  return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'rejected':  return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'expired':   return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      default:          return 'bg-white/5 text-subtext border border-white/10';
    }
  }

  protected getStatusIcon(status: Proposal['status']): string {
    switch (status) {
      case 'pending':   return 'fa-solid fa-clock';
      case 'accepted':  return 'fa-solid fa-check';
      case 'completed': return 'fa-solid fa-flag-checkered';
      case 'rejected':  return 'fa-solid fa-xmark';
      case 'expired':   return 'fa-solid fa-hourglass-end';
      default:          return 'fa-solid fa-circle';
    }
  }

  protected getStatusLabel(status: Proposal['status']): string {
    switch (status) {
      case 'pending':   return 'En attente';
      case 'accepted':  return 'Acceptée';
      case 'completed': return 'Terminée';
      case 'rejected':  return 'Refusée';
      case 'expired':   return 'Expirée (non répondu)';
      default:          return status;
    }
  }

  protected toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value === 'object' && 'seconds' in value) return new Date(value.seconds * 1000);
    return null;
  }
}
