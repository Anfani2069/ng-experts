import { ChangeDetectionStrategy, Component, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '@shared/components/dashboard-layout/dashboard-layout.component';
import { Auth } from '@core/services/auth.service';
import { ExpertService } from '@core/services/expert.service';
import { Proposal } from '@core/models/user.model';

@Component({
  selector: 'app-missions',
  templateUrl: './missions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardLayout]
})
export class Missions {
  private auth = inject(Auth);
  private expertService = inject(ExpertService);

  // State
  protected activeTab = signal<'proposals' | 'active'>('proposals');
  protected isLoading = signal(true);
  protected processingId = signal<string | null>(null);

  // Modals State
  protected selectedProposal = signal<Proposal | null>(null);
  protected showConfirmModal = signal<{
    type: 'accepted' | 'rejected';
    proposal: Proposal;
  } | null>(null);

  // Data
  protected allProposals = signal<Proposal[]>([]);

  // Computed Data
  protected pendingProposals = computed(() =>
    this.allProposals().filter(p => p.status === 'pending')
  );

  protected activeMissions = computed(() =>
    this.allProposals().filter(p => p.status === 'accepted' || p.status === 'completed' as any)
  );

  protected currentUser = this.auth.getCurrentUser();

  constructor() {
    // Effect to load data when user is available
    effect(() => {
      const user = this.currentUser();
      if (user && user.role === 'expert') {
        this.loadProposals(user.id);
      }
    });
  }

  async loadProposals(expertId: string) {
    try {
      this.isLoading.set(true);
      const data = await this.expertService.getProposalsForExpert(expertId);
      this.allProposals.set(data);
    } catch (error) {
      console.error('Error loading proposals', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Actions UI
  openDetails(proposal: Proposal) {
    this.selectedProposal.set(proposal);
  }

  closeDetails() {
    this.selectedProposal.set(null);
  }

  confirmAction(type: 'accepted' | 'rejected', proposal: Proposal) {
    this.showConfirmModal.set({ type, proposal });
  }

  closeConfirmModal() {
    this.showConfirmModal.set(null);
  }

  // Logic
  async executeAction() {
    const action = this.showConfirmModal();
    if (!action) return;

    const { type, proposal } = action;

    try {
      this.processingId.set(proposal.id!);
      this.closeConfirmModal();

      await this.expertService.updateProposalStatus(proposal.id!, type);

      // Update local state
      this.allProposals.update(proposals =>
        proposals.map(p =>
          p.id === proposal.id ? { ...p, status: type } : p
        )
      );

      // Feedback
      if (type === 'accepted') {
        this.activeTab.set('active');
        this.selectedProposal.set(null);
      }

    } catch (error) {
      console.error('Error updating status', error);
      alert('Une erreur est survenue lors de la mise à jour.');
    } finally {
      this.processingId.set(null);
    }
  }
}
