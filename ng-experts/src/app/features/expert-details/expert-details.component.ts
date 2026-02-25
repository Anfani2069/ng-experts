import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed,
  signal,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Expert } from '@core/models/user.model';
import { ExpertService } from '@core/services/expert.service';
import { Auth } from '@core/services/auth.service';
import { SanitizeQuillPipe } from '@shared/pipes';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-expert-details',
  templateUrl: './expert-details.component.html',
  styleUrls: ['./expert-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SanitizeQuillPipe],
})
export class ExpertDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);
  private expertService = inject(ExpertService);

  // Signaux pour l'├®tat du component




  // Signaux pour l'├®tat du component
  private expertId = signal<string>('');
  private currentExpert = signal<Expert | null>(null);
  private isLoading = signal<boolean>(false);

  // Signal pour les donn├®es d'expert (avec fallback vers les donn├®es mock├®es)
  protected readonly expertData = computed(() => {
    return this.currentExpert();
  });

  // Signal pour le statut de chargement
  protected readonly loading = this.isLoading.asReadonly();

  // Computed properties pour l'affichage
  protected readonly fullName = computed(() => {
    const expert = this.expertData();
    if (!expert) return '';
    const firstNameInitial = expert.firstName || '';
    const lastNameInitial = expert.lastName ? expert.lastName.charAt(0).toUpperCase() + '.' : '';
    return `${firstNameInitial} ${lastNameInitial}`.trim();
  });

  protected readonly userAvatar = computed(() => {
    const expert = this.expertData();
    return expert?.avatar || '';
  });

  protected readonly availabilityStatus = computed(() => {
    const expert = this.expertData();
    return expert?.isAvailable ? 'Disponible' : 'Non disponible';
  });

  protected readonly fullLocation = computed(() => {
    const expert = this.expertData();
    return expert ? `${expert.city}, ${expert.location}` : '';
  });

  protected readonly memberSince = computed(() => {
    const expert = this.expertData();
    if (!expert?.createdAt) return '';
    const date = new Date(expert.createdAt);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  });

  protected readonly jobTitle = computed(() => {
    const expert = this.expertData();
    if (!expert) return '';
    if (expert.title?.trim()) return expert.title.trim();
    const mainSkill = expert?.skills?.[0]?.name || 'Angular';
    return `Expert ${mainSkill}`;
  });

  protected readonly totalExperience = computed(() => {
    const expert = this.expertData();
    if (!expert) return '';
    const firstExp = expert?.experience?.[expert.experience.length - 1];
    if (firstExp?.startDate) {
      const start = new Date(firstExp.startDate).getFullYear();
      const now = new Date().getFullYear();
      return `${now - start} ans`;
    }
    return '';
  });

  protected readonly responseRate = computed(() => {
    const expert = this.expertData();
    return expert?.responseRate ? `${expert.responseRate}%` : '100%';
  });

  protected readonly responseTime = computed(() => {
    const expert = this.expertData();
    return expert?.responseTime || '1h';
  });

  protected readonly recommendationsCount = computed(() => {
    const expert = this.expertData();
    return expert?.recommendationsCount || 0;
  });

  protected readonly languages = computed(() => {
    const expert = this.expertData();
    return expert?.languages?.join(', ') || 'Fran├ºais';
  });

  protected readonly workPreferenceLabel = computed(() => {
    const expert = this.expertData();
    switch (expert?.availability?.workPreference) {
      case 'remote': return 'Remote Only';
      case 'hybrid': return 'Remote & Onsite';
      case 'onsite': return 'Onsite Only';
      default: return 'Flexible';
    }
  });

  // Rating safe accessor
  protected readonly rating = computed(() => this.expertData()?.rating || 5.0);
  protected readonly reviewsCount = computed(() => this.expertData()?.reviewsCount || 0);

  protected readonly hasSkills = computed(() => {
    const expert = this.expertData();
    return expert?.skills && expert.skills.length > 0;
  });

  protected readonly hasExperience = computed(() => {
    const expert = this.expertData();
    return expert?.experience && expert.experience.length > 0;
  });

  protected readonly hasCertifications = computed(() => {
    const expert = this.expertData();
    return expert?.certifications && expert.certifications.length > 0;
  });

  /**
   * Convertir une date Firestore Timestamp en Date JavaScript
   * Retourne null si la date est invalide pour ├®viter les erreurs du DatePipe
   */
  protected toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Timestamp) return value.toDate();
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    // G├®rer les objets Timestamp s├®rialis├®s (avec seconds et nanoseconds)
    if (typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      return new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
    }
    // G├®rer les cha├«nes de date
    if (typeof value === 'string' && value.trim() !== '') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    // G├®rer les timestamps num├®riques
    if (typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.expertId.set(id);
        await this.loadExpertData(id);
        this.checkPendingProposalDraft();
      }
    });
  }



  /**
   * Charge les donn├®es d'un expert depuis Firebase ou utilise les donn├®es mock├®es en fallback
   */
  private async loadExpertData(expertId: string): Promise<void> {
    try {
      this.isLoading.set(true);

      // Tenter de r├®cup├®rer depuis Firebase
      const expertFromFirebase = await this.expertService.getExpertById(expertId);

      if (expertFromFirebase) {
        console.log('Ô£à Donn├®es r├®cup├®r├®es depuis Firebase:', expertFromFirebase);
        this.currentExpert.set(expertFromFirebase);
      } else {
        // Fallback vers les donn├®es mock├®es
        console.log('ÔÜá´©Å Firebase indisponible, utilisation des donn├®es mock├®es');
        const mockExpert = this.expertService.getMockExpertById(expertId);
        this.currentExpert.set(mockExpert as Expert);
      }
    } catch (error) {
      console.error('ÔØî Erreur lors du chargement des donn├®es:', error);
      // En cas d'erreur, utiliser les donn├®es mock├®es
      const mockExpert = this.expertService.getMockExpertById(expertId);
      this.currentExpert.set(mockExpert as Expert);
    } finally {
      this.isLoading.set(false);
    }
  }

  private toTimestamp(value: any): number {
    if (!value) return 0;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'object' && 'seconds' in value) return value.seconds * 1000;
    return new Date(value).getTime() || 0;
  }

  protected readonly sortedExperience = computed(() => {
    const exp = this.expertData()?.experience || [];
    return [...exp].sort((a, b) => this.toTimestamp(b.startDate) - this.toTimestamp(a.startDate));
  });

  protected readonly sortedEducation = computed(() => {
    const edu = this.expertData()?.education || [];
    return [...edu].sort((a, b) => this.toTimestamp(b.startDate) - this.toTimestamp(a.startDate));
  });

  // Proposal Modal State
  protected showProposalModal = signal<boolean>(false);
  protected isSubmitting = signal<boolean>(false);
  protected proposalSent = signal<boolean>(false);
  protected proposalError = signal<string | null>(null);

  protected proposalForm = signal({
    title: '',
    description: '',
    budget: '',
    email: '',
    startDate: ''
  });

  /** True when the logged-in user is a recruiter */
  protected readonly isRecruiter = computed(() => this.auth.isRecruiter());

  // Actions
  protected onContact(): void {
    console.log('Contacting expert:', this.expertData()?.id);
  }

  protected onHire(): void {
    this.openProposalModal();
  }

  protected openProposalModal(): void {
    this.proposalSent.set(false);
    this.proposalError.set(null);

    const draftKey = `proposal_draft_${this.expertId()}`;
    const savedDraft = sessionStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        this.proposalForm.set(JSON.parse(savedDraft));
        sessionStorage.removeItem(draftKey);
      } catch {
        this.proposalForm.set({ title: '', description: '', budget: '', email: '', startDate: '' });
      }
    } else {
      this.proposalForm.set({ title: '', description: '', budget: '', email: '', startDate: '' });
    }

    this.showProposalModal.set(true);
  }

  protected closeProposalModal(): void {
    this.showProposalModal.set(false);
  }

  protected updateForm(field: string, value: string): void {
    this.proposalForm.update(form => ({ ...form, [field]: value }));
  }

  protected async submitProposal(): Promise<void> {
    if (this.isSubmitting()) return;

    const form = this.proposalForm();
    const expert = this.expertData();
    if (!expert) return;

    if (!form.title.trim()) {
      this.proposalError.set('Le titre du projet est requis.');
      return;
    }

    const currentUser = this.auth.getCurrentUser()();

    if (!currentUser || currentUser.role !== 'recruiter') {
      const draftKey = `proposal_draft_${expert.id}`;
      sessionStorage.setItem(draftKey, JSON.stringify(form));
      sessionStorage.setItem('proposal_expert_id', expert.id);
      this.closeProposalModal();
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/experts/${expert.id}`, action: 'proposal' }
      });
      return;
    }

    this.isSubmitting.set(true);
    this.proposalError.set(null);

    try {
      const clientName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ').trim() || currentUser.email;
      const proposal: Omit<import('@core/models/user.model').Proposal, 'id'> = {
        expertId: expert.id,
        clientId: currentUser.id,
        clientEmail: currentUser.email,
        clientName,
        title: form.title.trim(),
        description: form.description.trim(),
        budget: form.budget.trim(),
        startDate: form.startDate || 'À définir',
        status: 'pending',
        createdAt: new Date()
      };

      await this.expertService.addProposal(proposal, clientName);
      this.proposalSent.set(true);
      setTimeout(() => this.closeProposalModal(), 2000);

    } catch (error) {
      console.error('Erreur lors de l\'envoi de la proposition:', error);
      this.proposalError.set('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected goBack(): void {
    this.router.navigate(['/']);
  }

  private checkPendingProposalDraft(): void {
    const expertId = this.expertId();
    if (!expertId) return;
    const draftKey = `proposal_draft_${expertId}`;
    const pendingExpertId = sessionStorage.getItem('proposal_expert_id');
    if (pendingExpertId === expertId && sessionStorage.getItem(draftKey)) {
      sessionStorage.removeItem('proposal_expert_id');
      setTimeout(() => this.openProposalModal(), 400);
    }
  }
}
