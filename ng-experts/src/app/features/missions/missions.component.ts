import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardLayout } from '@shared/components/dashboard-layout/dashboard-layout.component';
import { Auth } from '@core/services/auth.service';
import { ExpertService } from '@core/services/expert.service';
import { MessagingService } from '@core/services/messaging.service';
import { Proposal } from '@core/models/user.model';

@Component({
  selector: 'app-missions',
  templateUrl: './missions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardLayout, DatePipe, RouterModule]
})
export class Missions implements OnInit {
  private auth = inject(Auth);
  private expertService = inject(ExpertService);
  private messaging = inject(MessagingService);
  private router = inject(Router);

  protected readonly currentUser = this.auth.getCurrentUser();

  // State
  protected readonly isLoading = signal(true);
  protected readonly activeFilter = signal<'all' | 'pending' | 'accepted' | 'completed' | 'rejected'>('all');
  protected readonly processingId = signal<string | null>(null);
  protected readonly allProposals = signal<Proposal[]>([]);

  // Modals
  protected readonly selectedProposal = signal<Proposal | null>(null);
  protected readonly showConfirmModal = signal<{
    type: 'accepted' | 'rejected' | 'completed';
    proposal: Proposal;
  } | null>(null);

  // Stats
  protected readonly stats = computed(() => {
    const p = this.allProposals();
    return {
      total: p.length,
      pending: p.filter(x => x.status === 'pending').length,
      accepted: p.filter(x => x.status === 'accepted').length,
      completed: p.filter(x => x.status === 'completed').length,
      rejected: p.filter(x => x.status === 'rejected').length
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
    this.isLoading.set(true);
    try {
      await this.auth.waitForUser();
      await this.loadProposals();
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadProposals(): Promise<void> {
    const user = this.currentUser();
    if (!user || user.role !== 'expert') return;
    try {
      const data = await this.expertService.getProposalsForExpert(user.id);
      this.allProposals.set(data);
    } catch (e) {
      console.error('Erreur chargement missions expert:', e);
    }
  }

  // UI Actions
  protected openDetails(proposal: Proposal): void {
    this.selectedProposal.set(proposal);
  }

  protected closeDetails(): void {
    this.selectedProposal.set(null);
  }

  protected confirmAction(type: 'accepted' | 'rejected' | 'completed', proposal: Proposal): void {
    this.showConfirmModal.set({ type, proposal });
  }

  protected closeConfirmModal(): void {
    this.showConfirmModal.set(null);
  }

  protected async executeAction(): Promise<void> {
    const action = this.showConfirmModal();
    if (!action) return;

    const { type, proposal } = action;

    try {
      this.processingId.set(proposal.id!);
      this.closeConfirmModal();

      await this.expertService.updateProposalStatus(
        proposal.id!,
        type,
        `${this.currentUser()?.firstName} ${this.currentUser()?.lastName}`
      );

      // Mise à jour locale
      this.allProposals.update(list =>
        list.map(p => p.id === proposal.id ? { ...p, status: type, ...(type === 'completed' ? { completedAt: new Date() } : {}) } : p)
      );

      this.selectedProposal.set(null);
    } catch (e) {
      console.error('Erreur mise à jour statut:', e);
    } finally {
      this.processingId.set(null);
    }
  }

  protected async contactRecruiter(proposal: Proposal): Promise<void> {
    const user = this.currentUser();
    if (!user || !proposal.clientId) return;
    try {
      await this.messaging.getOrCreateConversation(
        user.id,
        proposal.clientId,
        { name: `${user.firstName} ${user.lastName}`, avatar: user.avatar, role: 'expert' },
        { name: proposal.clientEmail || 'Recruteur', avatar: undefined, role: 'recruiter' },
        proposal.id,
        proposal.title
      );
      this.closeDetails();
      this.router.navigate(['/messages']);
    } catch (e) {
      console.error('Erreur contact recruteur:', e);
    }
  }

  protected getStatusClass(status: Proposal['status']): string {
    switch (status) {
      case 'pending':   return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'accepted':  return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'rejected':  return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:          return 'bg-white/5 text-subtext border border-white/10';
    }
  }

  protected getStatusIcon(status: Proposal['status']): string {
    switch (status) {
      case 'pending':   return 'fa-solid fa-clock';
      case 'accepted':  return 'fa-solid fa-check';
      case 'completed': return 'fa-solid fa-flag-checkered';
      case 'rejected':  return 'fa-solid fa-xmark';
      default:          return 'fa-solid fa-circle';
    }
  }

  protected getStatusLabel(status: Proposal['status']): string {
    switch (status) {
      case 'pending':   return 'En attente';
      case 'accepted':  return 'En cours';
      case 'completed': return 'Terminée';
      case 'rejected':  return 'Refusée';
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
