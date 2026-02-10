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

@Component({
  selector: 'app-expert-details',
  templateUrl: './expert-details.component.html',
  styleUrls: ['./expert-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ExpertDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);
  private expertService = inject(ExpertService);

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
    return expert ? `${expert.firstName} ${expert.lastName}` : 'Expert Angular';
  });

  protected readonly userAvatar = computed(() => {
    const expert = this.expertData();
    return expert?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg';
  });

  protected readonly availabilityStatus = computed(() => {
    const expert = this.expertData();
    return expert?.isAvailable ? 'Disponible' : 'Non disponible';
  });

  protected readonly fullLocation = computed(() => {
    const expert = this.expertData();
    return expert ? `${expert.city}, ${expert.location}` : 'France';
  });

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

  // Actions
  protected onContact(): void {
    console.log('Contacting expert:', this.expertData()?.id);
    // Logique pour contacter l'expert
  }

  protected onHire(): void {
    console.log('Hiring expert:', this.expertData()?.id);
    // Logique pour embaucher l'expert
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
