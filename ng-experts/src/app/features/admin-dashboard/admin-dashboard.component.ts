import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardLayout } from '@shared/components';
import { Auth } from '@core/services/auth.service';
import { AdminService, AdminStats } from '@core/services/admin.service';
import { BaseUser, Expert, Recruiter, Proposal } from '@core/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, DashboardLayout, DatePipe]
})
export class AdminDashboard implements OnInit {
  private auth = inject(Auth);
  private adminService = inject(AdminService);
  private router = inject(Router);

  protected readonly currentUser = this.auth.getCurrentUser();
  protected readonly isLoading = signal(true);
  protected readonly activeTab = signal<'overview' | 'experts' | 'recruiters' | 'proposals'>('overview');

  // Filtres
  protected readonly searchQuery = signal('');
  protected readonly verificationFilter = signal<'all' | 'pending' | 'verified' | 'rejected'>('all');

  // Données
  protected readonly users = this.adminService.users;
  protected readonly experts = this.adminService.experts;
  protected readonly recruiters = this.adminService.recruiters;
  protected readonly proposals = this.adminService.proposals;
  protected readonly stats = this.adminService.stats;

  // Modal de confirmation
  protected readonly showConfirmModal = signal(false);
  protected readonly confirmAction = signal<{ type: string; userId: string; userName: string } | null>(null);

  // Détail utilisateur
  protected readonly selectedUser = signal<BaseUser | null>(null);
  protected readonly showUserDetail = signal(false);

  protected readonly userName = computed(() => this.currentUser()?.firstName || 'Admin');

  protected readonly filteredExperts = computed(() => {
    let list = this.experts();
    const q = this.searchQuery().toLowerCase().trim();
    const vf = this.verificationFilter();

    if (q) {
      list = list.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q)
      );
    }
    if (vf !== 'all') {
      list = list.filter(e => e.verificationStatus === vf);
    }
    return list;
  });

  protected readonly filteredRecruiters = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.recruiters();
    return this.recruiters().filter(r =>
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.company?.toLowerCase().includes(q)
    );
  });

  protected readonly filteredProposals = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.proposals();
    return this.proposals().filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.clientEmail?.toLowerCase().includes(q)
    );
  });

  protected readonly recentUsers = computed(() => {
    return [...this.users()]
      .sort((a, b) => {
        const da = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const db = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return db - da;
      })
      .slice(0, 8);
  });

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      await Promise.all([
        this.adminService.loadAllUsers(),
        this.adminService.loadAllProposals(),
      ]);
      this.adminService.computeStats();
    } finally {
      this.isLoading.set(false);
    }
  }

  protected setTab(tab: 'overview' | 'experts' | 'recruiters' | 'proposals'): void {
    this.activeTab.set(tab);
    this.searchQuery.set('');
    this.verificationFilter.set('all');
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected setVerificationFilter(filter: 'all' | 'pending' | 'verified' | 'rejected'): void {
    this.verificationFilter.set(filter);
  }

  // ── Actions Admin ──────────────────────────────────────────────

  protected async verifyExpert(userId: string): Promise<void> {
    try {
      await this.adminService.setVerificationStatus(userId, 'verified');
      this.adminService.computeStats();
    } catch (e) {
      console.error(e);
    }
  }

  protected async rejectExpert(userId: string): Promise<void> {
    try {
      await this.adminService.setVerificationStatus(userId, 'rejected');
      this.adminService.computeStats();
    } catch (e) {
      console.error(e);
    }
  }

  protected async resetToPending(userId: string): Promise<void> {
    try {
      await this.adminService.setVerificationStatus(userId, 'pending');
      this.adminService.computeStats();
    } catch (e) {
      console.error(e);
    }
  }

  protected async toggleActive(userId: string, isActive: boolean): Promise<void> {
    try {
      await this.adminService.toggleUserActive(userId, !isActive);
      this.adminService.computeStats();
    } catch (e) {
      console.error(e);
    }
  }

  protected openDeleteConfirm(userId: string, userName: string): void {
    this.confirmAction.set({ type: 'delete', userId, userName });
    this.showConfirmModal.set(true);
  }

  protected async confirmDelete(): Promise<void> {
    const action = this.confirmAction();
    if (!action) return;
    try {
      await this.adminService.deleteUser(action.userId);
      this.adminService.computeStats();
    } catch (e) {
      console.error(e);
    } finally {
      this.showConfirmModal.set(false);
      this.confirmAction.set(null);
    }
  }

  protected cancelConfirm(): void {
    this.showConfirmModal.set(false);
    this.confirmAction.set(null);
  }

  protected viewUserDetail(user: BaseUser): void {
    this.selectedUser.set(user);
    this.showUserDetail.set(true);
  }

  protected closeUserDetail(): void {
    this.showUserDetail.set(false);
    this.selectedUser.set(null);
  }

  protected viewExpertProfile(expertId: string): void {
    this.router.navigate(['/expert', expertId]);
  }

  // ── Helpers ────────────────────────────────────────────────────

  protected getVerificationClass(status: string): string {
    switch (status) {
      case 'verified': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'pending':  return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:         return 'bg-white/5 text-subtext border border-white/10';
    }
  }

  protected getVerificationLabel(status: string): string {
    switch (status) {
      case 'verified': return 'Vérifié';
      case 'pending':  return 'En attente';
      case 'rejected': return 'Rejeté';
      default:         return status;
    }
  }

  protected getProposalStatusClass(status: string): string {
    switch (status) {
      case 'pending':   return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'accepted':  return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'rejected':  return 'bg-white/5 text-subtext border border-white/10';
      default:          return 'bg-white/5 text-subtext border border-white/10';
    }
  }

  protected getProposalStatusLabel(status: string): string {
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

  protected getMaxSignups(): number {
    const s = this.stats();
    if (!s) return 1;
    return Math.max(...s.recentSignups.map(r => r.count), 1);
  }

  protected getUserNameById(userId: string): string {
    return this.adminService.getUserNameById(userId);
  }

  protected asExpert(user: BaseUser): Expert {
    return user as Expert;
  }

  protected asRecruiter(user: BaseUser): Recruiter {
    return user as Recruiter;
  }
}
