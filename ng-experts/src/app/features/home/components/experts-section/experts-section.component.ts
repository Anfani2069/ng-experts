import { ChangeDetectionStrategy, Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Expert } from '@core/models/user.model';
import { ExpertService } from '@core/services/expert.service';

@Component({
  selector: 'app-experts-section',
  templateUrl: './experts-section.component.html',
  styleUrls: ['./experts-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ExpertsSection implements OnInit {
  private readonly expertService = inject(ExpertService);
  private readonly router = inject(Router);

  // Filtres
  protected readonly cityFilter = signal('');
  protected readonly techFilter = signal('');
  protected readonly selectedAvailabilityTypes = signal<string[]>([]);

  // Types de disponibilité disponibles
  protected readonly availabilityTypes = [
    { value: 'consulting', label: 'Conférence' },
    { value: 'mentoring', label: 'Mentoring' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'cdi', label: 'CDI' },
    { value: 'coffee', label: 'Coffee chat' },
    { value: 'pair', label: 'Pair programming' },
    { value: 'review', label: 'Relecture CV' }
  ];

  // Données des experts depuis Firebase
  protected readonly experts = this.expertService.expertsData;
  protected readonly isLoading = this.expertService.loading;
  protected readonly error = this.expertService.errorMessage;

  // Experts filtrés (computed signal)
  protected readonly filteredExperts = computed(() => {
    const allExperts = this.experts();
    const city = this.cityFilter().toLowerCase().trim();
    const tech = this.techFilter().toLowerCase().trim();
    const selectedTypes = this.selectedAvailabilityTypes();

    return allExperts.filter(expert => {
      // Masquer les profils gelés (frozenUntil dans le futur)
      const frozenUntil = (expert as any).frozenUntil;
      if (frozenUntil) {
        const frozenDate = frozenUntil instanceof Date ? frozenUntil
          : (typeof frozenUntil === 'object' && 'seconds' in frozenUntil) ? new Date(frozenUntil.seconds * 1000)
          : null;
        if (frozenDate && frozenDate.getTime() > Date.now()) {
          return false;
        }
      }

      // Filtre par ville
      if (city && !expert.city.toLowerCase().includes(city)) {
        return false;
      }

      // Filtre par technologie
      if (tech) {
        const hasSkill = expert.skills.some(skill =>
          skill.name.toLowerCase().includes(tech)
        );
        if (!hasSkill) return false;
      }

      // Filtre par types de disponibilité
      if (selectedTypes.length > 0) {
        const hasSelectedType = selectedTypes.some(selectedType => {
          // Map certains types vers les types d'experts
          if (selectedType === 'consulting' || selectedType === 'cdi') {
            return expert.availability.types.includes('consulting' as any);
          }
          if (selectedType === 'coffee' || selectedType === 'pair' || selectedType === 'review') {
            return expert.availability.types.includes('mentoring' as any);
          }
          // Pour freelance qui existe tel quel
          if (selectedType === 'freelance') {
            return expert.availability.types.includes('freelance' as any);
          }
          return false;
        });
        if (!hasSelectedType) return false;
      }

      return true;
    });
  });

  async ngOnInit() {
    // Charger les experts depuis Firebase au démarrage
    await this.expertService.getAllExperts();
  }

  protected onCityFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.cityFilter.set(target.value);
  }

  protected onTechFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.techFilter.set(target.value);
  }

  protected toggleAvailabilityType(type: string): void {
    const current = this.selectedAvailabilityTypes();
    if (current.includes(type)) {
      // Retirer le type
      this.selectedAvailabilityTypes.set(current.filter(t => t !== type));
    } else {
      // Ajouter le type
      this.selectedAvailabilityTypes.set([...current, type]);
    }
  }

  protected getAvailabilityButtonClass(type: string): string {
    const isSelected = this.selectedAvailabilityTypes().includes(type);
    return isSelected
      ? 'bg-primary text-white border-primary'
      : 'bg-transparent text-subtext border-border hover:border-primary hover:text-white';
  }

  protected resetFilters(): void {
    this.cityFilter.set('');
    this.techFilter.set('');
    this.selectedAvailabilityTypes.set([]);
  }

  protected onHireExpert(expertId: string): void {
    // Remonter en haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Naviguer vers la page de détails de l'expert
    this.router.navigate(['/expert', expertId]);
  }

  protected toggleFavorite(expertId: string, event: Event): void {
    // Empêcher la propagation du clic vers la card
    event.stopPropagation();
    // TODO: Implémenter la logique pour ajouter/retirer des favoris
    console.log('Toggle favorite for expert:', expertId);
  }

  protected onShowAllExperts(): void {
    // Remonter en haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.router.navigate(['/experts']);
  }

  // Helper pour obtenir le nom complet au format "Prénom N."
  protected getFullName(expert: Expert): string {
    const firstName = expert.firstName || '';
    const lastNameInitial = expert.lastName ? expert.lastName.charAt(0).toUpperCase() + '.' : '';
    return `${firstName} ${lastNameInitial}`.trim();
  }

  // Helper pour obtenir les noms des compétences
  protected getSkillNames(expert: Expert): string[] {
    return expert.skills.map(skill => skill.name);
  }

  // Helper pour formater les types de disponibilité
  protected formatAvailabilityType(type: string): string {
    const mapping: Record<string, string> = {
      'freelance': 'Freelance',
      'consulting': 'Consulting',
      'mentoring': 'Mentoring'
    };
    return mapping[type] || type;
  }

  // Helper pour formater le mode de travail
  protected formatWorkPreference(preference: string): string {
    const mapping: Record<string, string> = {
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'onsite': 'On-site',
      'flexible': 'Flexible'
    };
    return mapping[preference] || preference;
  }

  // Helper pour obtenir la date actuelle formatée
  protected getCurrentDate(): string {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  }
}
