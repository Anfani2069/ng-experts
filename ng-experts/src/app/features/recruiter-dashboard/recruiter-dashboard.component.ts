import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardLayout } from '@shared/components';
import { Auth } from '@core/services/auth.service';
import { ExpertService } from '@core/services/expert.service';
import { MessagingService } from '@core/services/messaging.service';
import { Expert, Recruiter, Proposal } from '@core/models/user.model';

@Component({
  selector: 'app-recruiter-dashboard',
  templateUrl: './recruiter-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, DashboardLayout, DatePipe]
})
export class RecruiterDashboard implements OnInit {
  private auth = inject(Auth);
  private expertService = inject(ExpertService);
  private router = inject(Router);
  private messaging = inject(MessagingService);

  protected readonly currentUser = this.auth.getCurrentUser();
  protected readonly recruiter = computed(() => {
    const u = this.currentUser();
    return u?.role === 'recruiter' ? u as Recruiter : null;
  });
  protected readonly userName = computed(() => this.currentUser()?.firstName || '');
  protected readonly isUserLoaded = computed(() => this.currentUser() !== null);

  protected readonly isLoading = signal(false);
  protected readonly experts = signal<Expert[]>([]);
  protected readonly myProposals = signal<Proposal[]>([]);
  protected readonly searchQuery = signal('');

  protected readonly showProposalModal = signal(false);
  protected readonly selectedExpert = signal<Expert | null>(null);
  protected readonly selectedExperts = signal<Expert[]>([]); // multi-select
  protected readonly isSending = signal(false);
  protected readonly proposalSent = signal(false);
  protected readonly proposalSentCount = signal(0);
  protected readonly proposalError = signal<string | null>(null);

  protected readonly priorityOptions = [
    { value: 'urgent', label: '🔴 Urgent', desc: 'Besoin immédiat' },
    { value: 'high',   label: '🟠 Élevé',  desc: 'Dans les 2 semaines' },
    { value: 'normal', label: '🟡 Normal', desc: 'Sans contrainte' },
    { value: 'low',    label: '🟢 Faible', desc: 'Besoin à long terme' },
  ];

  protected readonly proposalForm = signal({ title: '', description: '', budget: '', startDate: '', priority: 'normal' as 'urgent' | 'high' | 'normal' | 'low' });

  protected readonly filteredExperts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    // Filtrer les profils gelés
    const visibleExperts = this.experts().filter(e => {
      const frozenUntil = (e as any).frozenUntil;
      if (frozenUntil) {
        const frozenDate = frozenUntil instanceof Date ? frozenUntil
          : (typeof frozenUntil === 'object' && 'seconds' in frozenUntil) ? new Date(frozenUntil.seconds * 1000)
          : null;
        if (frozenDate && frozenDate.getTime() > Date.now()) return false;
      }
      return true;
    });
    if (!q) return visibleExperts;
    return visibleExperts.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.skills?.some(s => s.name.toLowerCase().includes(q)) ||
      e.bio?.toLowerCase().includes(q) ||
      e.city?.toLowerCase().includes(q)
    );
  });

  protected readonly stats = computed(() => {
    const proposals = this.myProposals();
    return {
      sent: proposals.length,
      pending: proposals.filter(p => p.status === 'pending').length,
      accepted: proposals.filter(p => p.status === 'accepted').length,
      completed: proposals.filter(p => p.status === 'completed').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
    };
  });

  protected readonly recentProposals = computed(() => {
    return [...this.myProposals()]
      .sort((a, b) => {
        const da = this.toDate(a.createdAt)?.getTime() ?? 0;
        const db = this.toDate(b.createdAt)?.getTime() ?? 0;
        return db - da;
      })
      .slice(0, 4);
  });

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      const experts = await this.expertService.getAllExperts();
      this.experts.set(experts);
      await this.loadMyProposals();
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadMyProposals(): Promise<void> {
    const user = this.currentUser();
    if (!user) return;
    try {
      const ref = await import('firebase/firestore');
      const { firebase } = await import('@core/config/firebase.config');
      const q = ref.query(
        ref.collection(firebase.firestore, 'proposals'),
        ref.where('clientId', '==', user.id)
      );
      const snap = await ref.getDocs(q);
      const proposals: Proposal[] = [];
      snap.forEach(d => proposals.push({ id: d.id, ...d.data() } as Proposal));
      proposals.sort((a, b) => {
        const da = new Date((a.createdAt as any)?.seconds * 1000 || 0);
        const db = new Date((b.createdAt as any)?.seconds * 1000 || 0);
        return db.getTime() - da.getTime();
      });
      this.myProposals.set(proposals);
    } catch (e) {
      console.error('Erreur chargement propositions recruteur', e);
    }
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected openProposalModal(expert: Expert): void {
    this.selectedExpert.set(expert);
    // Ajouter l'expert à la sélection s'il n'y est pas déjà
    const current = this.selectedExperts();
    if (!current.find(e => e.id === expert.id)) {
      this.selectedExperts.set([...current, expert]);
    }
    this.proposalForm.set({ title: '', description: '', budget: '', startDate: '', priority: 'normal' });
    this.proposalSent.set(false);
    this.proposalError.set(null);
    this.showProposalModal.set(true);
  }

  protected closeProposalModal(): void {
    this.showProposalModal.set(false);
    this.selectedExpert.set(null);
    this.selectedExperts.set([]);
  }

  protected toggleExpertSelection(expert: Expert): void {
    const current = this.selectedExperts();
    const exists = current.find(e => e.id === expert.id);
    if (exists) {
      this.selectedExperts.set(current.filter(e => e.id !== expert.id));
    } else {
      this.selectedExperts.set([...current, expert]);
    }
  }

  protected isExpertSelected(expertId: string): boolean {
    return this.selectedExperts().some(e => e.id === expertId);
  }

  protected updateForm(field: string, value: string): void {
    this.proposalForm.update(f => ({ ...f, [field]: value }));
  }

  protected async sendProposal(): Promise<void> {
    const targets = this.selectedExperts();
    const user = this.currentUser();
    const form = this.proposalForm();
    if (!targets.length || !user) return;
    if (!form.title.trim() || !form.description.trim()) {
      this.proposalError.set('Le titre et la description sont obligatoires.');
      return;
    }
    this.isSending.set(true);
    this.proposalError.set(null);
    try {
      const recruiter = this.recruiter();
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
      const company = recruiter?.company !== 'Non renseigné' ? recruiter?.company : undefined;
      const clientName = (fullName && company)
        ? `${fullName} — ${company}`
        : fullName || company || user.email;
      await Promise.all(targets.map(expert => {
        const proposal: Omit<Proposal, 'id'> = {
          expertId: expert.id,
          clientId: user.id,
          clientEmail: user.email,
          clientName,
          title: form.title.trim(),
          description: form.description.trim(),
          budget: form.budget.trim() || undefined,
          startDate: form.startDate || 'À définir',
          priority: form.priority,
          status: 'pending',
          createdAt: new Date()
        };
        return this.expertService.addProposal(proposal, clientName);
      }));
      this.proposalSentCount.set(targets.length);
      this.proposalSent.set(true);
      await this.loadMyProposals();
      setTimeout(() => this.closeProposalModal(), 2500);
    } catch (e) {
      this.proposalError.set('Erreur lors de l\'envoi. Veuillez réessayer.');
      console.error(e);
    } finally {
      this.isSending.set(false);
    }
  }

  protected viewExpert(expert: Expert): void {
    this.router.navigate(['/expert', expert.id]);
  }

  protected async contactExpertFromProposal(proposal: Proposal): Promise<void> {
    const user = this.currentUser();
    if (!user) return;
    try {
      const expert = await this.expertService.getExpertById(proposal.expertId);
      if (!expert) { this.router.navigate(['/messages']); return; }
      await this.messaging.getOrCreateConversation(
        user.id, expert.id,
        { name: `${user.firstName} ${user.lastName}`, avatar: user.avatar, role: 'recruiter' },
        { name: `${expert.firstName} ${expert.lastName}`, avatar: expert.avatar, role: 'expert' },
        proposal.id, proposal.title
      );
      this.router.navigate(['/messages']);
    } catch (e) {
      console.error('Erreur contact expert:', e);
    }
  }

  protected getProposalStatusClass(status: Proposal['status']): string {
    switch (status) {
      case 'pending':   return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'accepted':  return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'rejected':  return 'bg-white/5 text-subtext border border-white/10';
      case 'expired':   return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      default:          return 'bg-white/5 text-subtext border border-white/10';
    }
  }

  protected getProposalStatusLabel(status: Proposal['status']): string {
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
}
