import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DashboardLayout } from '@shared/components';
import { Auth } from '@core/services/auth.service';
import { ExpertService } from '@core/services/expert.service';
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

  // Utilisateur connecté
  protected readonly currentUser = this.auth.getCurrentUser();
  protected readonly recruiter = computed(() => {
    const u = this.currentUser();
    return u?.role === 'recruiter' ? u as Recruiter : null;
  });
  protected readonly userName = computed(() => this.currentUser()?.firstName || '');
  protected readonly isUserLoaded = computed(() => this.currentUser() !== null);

  // État
  protected readonly isLoading = signal(false);
  protected readonly experts = signal<Expert[]>([]);
  protected readonly myProposals = signal<Proposal[]>([]);
  protected readonly searchQuery = signal('');

  // Modal envoi proposition
  protected readonly showProposalModal = signal(false);
  protected readonly selectedExpert = signal<Expert | null>(null);
  protected readonly isSending = signal(false);
  protected readonly proposalSent = signal(false);
  protected readonly proposalError = signal<string | null>(null);

  // Formulaire proposition
  protected readonly proposalForm = signal({
    title: '',
    description: '',
    budget: '',
    startDate: ''
  });

  // Experts filtrés par recherche
  protected readonly filteredExperts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.experts();
    return this.experts().filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.skills?.some(s => s.name.toLowerCase().includes(q)) ||
      e.bio?.toLowerCase().includes(q) ||
      e.city?.toLowerCase().includes(q)
    );
  });

  // Stats calculées
  protected readonly stats = computed(() => {
    const proposals = this.myProposals();
    return {
      sent: proposals.length,
      pending: proposals.filter(p => p.status === 'pending').length,
      accepted: proposals.filter(p => p.status === 'accepted').length,
      rejected: proposals.filter(p => p.status === 'rejected').length,
    };
  });

  // Propositions récentes (4 dernières)
  protected readonly recentProposals = computed(() =>
    this.myProposals().slice(0, 4)
  );

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      const [experts, proposals] = await Promise.all([
        this.expertService.getAllExperts(),
        this.loadMyProposals()
      ]);
      this.experts.set(experts);
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
        const da = a.createdAt instanceof Date ? a.createdAt : new Date((a.createdAt as any)?.seconds * 1000 || 0);
        const db = b.createdAt instanceof Date ? b.createdAt : new Date((b.createdAt as any)?.seconds * 1000 || 0);
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
    this.proposalForm.set({ title: '', description: '', budget: '', startDate: '' });
    this.proposalSent.set(false);
    this.proposalError.set(null);
    this.showProposalModal.set(true);
  }

  protected closeProposalModal(): void {
    this.showProposalModal.set(false);
    this.selectedExpert.set(null);
  }

  protected updateForm(field: string, value: string): void {
    this.proposalForm.update(f => ({ ...f, [field]: value }));
  }

  protected async sendProposal(): Promise<void> {
    const expert = this.selectedExpert();
    const user = this.currentUser();
    const form = this.proposalForm();

    if (!expert || !user) return;
    if (!form.title.trim() || !form.description.trim() || !form.budget.trim()) {
      this.proposalError.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSending.set(true);
    this.proposalError.set(null);

    try {
      const proposal: Omit<Proposal, 'id'> = {
        expertId: expert.id,
        clientId: user.id,
        clientEmail: user.email,
        title: form.title.trim(),
        description: form.description.trim(),
        budget: form.budget.trim(),
        startDate: form.startDate || 'À définir',
        status: 'pending',
        createdAt: new Date()
      };

      await this.expertService.addProposal(proposal);
      this.proposalSent.set(true);

      // Recharger mes propositions
      await this.loadMyProposals();

      setTimeout(() => this.closeProposalModal(), 2000);
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

  protected getProposalStatusClass(status: Proposal['status']): string {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'rejected': return 'bg-white/5 text-subtext border border-white/10';
    }
  }

  protected getProposalStatusLabel(status: Proposal['status']): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
    }
  }

  protected toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value === 'object' && 'seconds' in value) return new Date(value.seconds * 1000);
    return null;
  }
}
