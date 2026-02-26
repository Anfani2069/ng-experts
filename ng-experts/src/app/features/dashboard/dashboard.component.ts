import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardLayout } from '@shared/components';
import { Auth } from '@core/services/auth.service';
import { ExpertService } from '@core/services/expert.service';
import { FreezeService } from '@core/services/freeze.service';
import { Proposal, Expert } from '@core/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, DashboardLayout]
})
export class Dashboard implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private expertService = inject(ExpertService);
  protected readonly freezeService = inject(FreezeService);

  protected readonly currentUser = this.auth.getCurrentUser();
  protected readonly userName = computed(() => this.currentUser()?.firstName || '');
  protected readonly isUserLoaded = computed(() => this.currentUser() !== null);

  protected readonly isLoading = signal(false);
  protected readonly proposals = signal<Proposal[]>([]);
  protected readonly processingId = signal<string | null>(null);
  protected readonly pendingRejectProposal = signal<Proposal | null>(null);
  protected readonly pendingAcceptProposal = signal<Proposal | null>(null);

  // Countdown timer
  private _countdownInterval: any = null;
  protected readonly countdownTick = signal(Date.now());

  protected readonly stats = computed(() => {
    const props = this.proposals();
    return {
      total: props.length,
      pending: props.filter(p => p.status === 'pending').length,
      accepted: props.filter(p => p.status === 'accepted').length,
      completed: props.filter(p => p.status === 'completed').length,
      rejected: props.filter(p => p.status === 'rejected').length,
      expired: props.filter(p => p.status === 'expired').length,
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
      const user = this.currentUser();
      if (user?.role === 'expert') {
        await this.freezeService.init(user as Expert);
      }
      await this.loadProposals();
      // Countdown timer — tick chaque seconde
      this._countdownInterval = setInterval(() => {
        this.countdownTick.set(Date.now());
      }, 1000);
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
    }
    this.freezeService.stopPeriodicCheck();
  }

  private async loadProposals(): Promise<void> {
    const user = this.currentUser();
    if (!user || user.role !== 'expert') return;
    try {
      const props = await this.expertService.getProposalsForExpert(user.id);
      props.sort((a, b) => {
        const toMs = (v: any) => {
          if (!v) return 0;
          if (v instanceof Date) return v.getTime();
          if (typeof v === 'object' && 'seconds' in v) return v.seconds * 1000;
          return 0;
        };
        return toMs(b.createdAt) - toMs(a.createdAt);
      });
      this.proposals.set(props);
    } catch (e) {
      console.error('Erreur chargement propositions:', e);
    }
  }

  protected confirmAccept(proposal: Proposal): void {
    this.pendingAcceptProposal.set(proposal);
  }

  protected cancelAccept(): void {
    this.pendingAcceptProposal.set(null);
  }

  protected async acceptProposal(proposal: Proposal): Promise<void> {
    if (!proposal.id || this.processingId()) return;
    this.pendingAcceptProposal.set(null);
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

  protected confirmReject(proposal: Proposal): void {
    this.pendingRejectProposal.set(proposal);
  }

  protected cancelReject(): void {
    this.pendingRejectProposal.set(null);
  }

  protected async rejectProposal(proposal: Proposal): Promise<void> {
    if (!proposal.id || this.processingId()) return;
    this.pendingRejectProposal.set(null);
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
      case 'expired':   return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      default:          return 'bg-white/5 text-subtext border border-white/10';
    }
  }

  protected getStatusLabel(status: Proposal['status']): string {
    switch (status) {
      case 'pending':   return 'En attente';
      case 'accepted':  return 'Acceptée';
      case 'completed': return 'Terminée';
      case 'rejected':  return 'Refusée';
      case 'expired':   return 'Expirée';
      default:          return status;
    }
  }

  protected toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value === 'object' && 'seconds' in value) return new Date(value.seconds * 1000);
    return null;
  }

  // ── Countdown & Freeze helpers ─────────────────────────────

  protected getCountdown(proposal: Proposal): string {
    this.countdownTick(); // force reactivity
    return this.freezeService.formatCountdown(this.freezeService.getTimeRemainingMs(proposal));
  }

  protected getCountdownPercent(proposal: Proposal): number {
    this.countdownTick();
    return this.freezeService.getProgressPercent(proposal);
  }

  protected isExpiringSoon(proposal: Proposal): boolean {
    this.countdownTick();
    const remaining = this.freezeService.getTimeRemainingMs(proposal);
    return remaining > 0 && remaining < 15 * 60 * 1000; // < 15 min
  }

  protected isExpired(proposal: Proposal): boolean {
    this.countdownTick();
    return this.freezeService.getTimeRemainingMs(proposal) <= 0;
  }

  protected getFreezeCountdown(): string {
    this.countdownTick();
    const ms = this.freezeService.freezeRemainingMs();
    if (ms <= 0) return '';
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    if (days > 0) return `${days}j ${hours}h ${mins}m`;
    return `${hours}h ${mins}m`;
  }
}
