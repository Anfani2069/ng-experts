import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardLayout } from '@shared/components';
import { Auth } from '@core/services/auth.service';
import { ExpertService } from '@core/services/expert.service';
import { Proposal } from '@core/models/user.model';

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

  protected readonly currentUser = this.auth.getCurrentUser();
  protected readonly userName = computed(() => this.currentUser()?.firstName || '');
  protected readonly isUserLoaded = computed(() => this.currentUser() !== null);

  protected readonly isLoading = signal(false);
  protected readonly proposals = signal<Proposal[]>([]);
  protected readonly processingId = signal<string | null>(null);

  protected readonly stats = computed(() => {
    const props = this.proposals();
    return {
      total: props.length,
      pending: props.filter(p => p.status === 'pending').length,
      accepted: props.filter(p => p.status === 'accepted').length,
      completed: props.filter(p => p.status === 'completed').length,
      rejected: props.filter(p => p.status === 'rejected').length,
    };
  });

  protected readonly recentProposals = computed(() => {
    return [...this.proposals()]
      .sort((a, b) => {
        const da = this.toDate(a.createdAt)?.getTime() ?? 0;
        const db = this.toDate(b.createdAt)?.getTime() ?? 0;
        return db - da;
      })
      .slice(0, 5);
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
      const props = await this.expertService.getProposalsForExpert(user.id);
      this.proposals.set(props);
    } catch (e) {
      console.error('Erreur chargement propositions:', e);
    }
  }

  protected async acceptProposal(proposal: Proposal): Promise<void> {
    if (!proposal.id || this.processingId()) return;
    this.processingId.set(proposal.id);
    try {
      await this.expertService.updateProposalStatus(
        proposal.id, 'accepted',
        `${this.currentUser()?.firstName} ${this.currentUser()?.lastName}`
      );
      this.proposals.update(list =>
        list.map(p => p.id === proposal.id ? { ...p, status: 'accepted' as const } : p)
      );
    } catch (e) {
      console.error('Erreur acceptation:', e);
    } finally {
      this.processingId.set(null);
    }
  }

  protected async rejectProposal(proposal: Proposal): Promise<void> {
    if (!proposal.id || this.processingId()) return;
    this.processingId.set(proposal.id);
    try {
      await this.expertService.updateProposalStatus(
        proposal.id, 'rejected',
        `${this.currentUser()?.firstName} ${this.currentUser()?.lastName}`
      );
      this.proposals.update(list =>
        list.map(p => p.id === proposal.id ? { ...p, status: 'rejected' as const } : p)
      );
    } catch (e) {
      console.error('Erreur refus:', e);
    } finally {
      this.processingId.set(null);
    }
  }

  protected getStatusClass(status: Proposal['status']): string {
    switch (status) {
      case 'pending':   return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'accepted':  return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'rejected':  return 'bg-white/5 text-subtext border border-white/10';
      default:          return 'bg-white/5 text-subtext border border-white/10';
    }
  }

  protected getStatusLabel(status: Proposal['status']): string {
    switch (status) {
      case 'pending':   return 'En attente';
      case 'accepted':  return 'Acceptée';
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
