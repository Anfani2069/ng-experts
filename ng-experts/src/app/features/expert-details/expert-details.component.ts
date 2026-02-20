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

  // Signaux pour l'état du component




  // Signaux pour l'état du component
  private expertId = signal<string>('');
  private currentExpert = signal<Expert | null>(null);
  private isLoading = signal<boolean>(false);

  // Signal pour les données d'expert (avec fallback vers les données mockées)
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
    const mainSkill = expert?.skills?.[0]?.name || 'Angular';
    return `Expert ${mainSkill} & Développement Web`;
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
    return expert?.languages?.join(', ') || 'Français';
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
   * Retourne null si la date est invalide pour éviter les erreurs du DatePipe
   */
  protected toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Timestamp) return value.toDate();
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    // Gérer les objets Timestamp sérialisés (avec seconds et nanoseconds)
    if (typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      return new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
    }
    // Gérer les chaînes de date
    if (typeof value === 'string' && value.trim() !== '') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    // Gérer les timestamps numériques
    if (typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  async ngOnInit(): Promise<void> {
    // Récupérer l'ID depuis les paramètres de route
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.expertId.set(id);
        await this.loadExpertData(id);
      }
    });
  }



  /**
   * Charge les données d'un expert depuis Firebase ou utilise les données mockées en fallback
   */
  private async loadExpertData(expertId: string): Promise<void> {
    try {
      this.isLoading.set(true);

      // Tenter de récupérer depuis Firebase
      const expertFromFirebase = await this.expertService.getExpertById(expertId);

      if (expertFromFirebase) {
        console.log('✅ Données récupérées depuis Firebase:', expertFromFirebase);
        this.currentExpert.set(expertFromFirebase);
      } else {
        // Fallback vers les données mockées
        console.log('⚠️ Firebase indisponible, utilisation des données mockées');
        const mockExpert = this.expertService.getMockExpertById(expertId);
        this.currentExpert.set(mockExpert as Expert);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      // En cas d'erreur, utiliser les données mockées
      const mockExpert = this.expertService.getMockExpertById(expertId);
      this.currentExpert.set(mockExpert as Expert);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Proposal Modal State
  protected showProposalModal = signal<boolean>(false);
  protected isSubmitting = signal<boolean>(false);
  protected proposalSent = signal<boolean>(false);

  protected proposalForm = signal({
    title: '',
    description: '',
    budget: '',
    email: '',
    startDate: ''
  });

  // Actions
  protected onContact(): void {
    console.log('Contacting expert:', this.expertData()?.id);
    // Logique pour contacter l'expert
  }

  protected onHire(): void {
    this.openProposalModal();
  }

  protected openProposalModal(): void {
    this.showProposalModal.set(true);
    this.proposalSent.set(false);
    // Reset form
    this.proposalForm.set({
      title: '',
      description: '',
      budget: '',
      email: '',
      startDate: ''
    });
  }

  protected closeProposalModal(): void {
    this.showProposalModal.set(false);
  }

  protected updateForm(field: string, value: string): void {
    this.proposalForm.update(form => ({ ...form, [field]: value }));
  }

  protected async submitProposal(): Promise<void> {
    if (this.isSubmitting()) return;

    // Validation basique
    const form = this.proposalForm();
    if (!form.title || !form.email) {
      alert('Veuillez remplir au moins le titre et votre email.');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const expert = this.expertData();
      if (!expert) throw new Error('Expert non trouvé');

      const currentUser = this.auth.getCurrentUser()();
      const proposal: Omit<import('@core/models/user.model').Proposal, 'id'> = {
        expertId: expert.id,
        clientEmail: form.email,
        title: form.title,
        description: form.description,
        budget: form.budget,
        startDate: form.startDate,
        status: 'pending',
        createdAt: new Date(),
        ...(currentUser?.id ? { clientId: currentUser.id } : {})
      };

      await this.expertService.addProposal(proposal);

      console.log('Proposal submitted successfully');
      this.isSubmitting.set(false);
      this.proposalSent.set(true);

      // Fermeture automatique après succès
      setTimeout(() => {
        this.closeProposalModal();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'envoi de la proposition:', error);
      this.isSubmitting.set(false);
      alert('Une erreur est survenue lors de l\'envoi de la proposition.');
    }
  }

  protected goBack(): void {
    this.router.navigate(['/']);
  }
}
