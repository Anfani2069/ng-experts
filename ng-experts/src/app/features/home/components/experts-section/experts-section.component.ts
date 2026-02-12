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
  protected readonly availabilityFilter = signal('Tous');

  // Données des experts depuis Firebase
  protected readonly experts = this.expertService.expertsData;
  protected readonly isLoading = this.expertService.loading;
  protected readonly error = this.expertService.errorMessage;

  // Experts filtrés (computed signal)
  protected readonly filteredExperts = computed(() => {
    const allExperts = this.experts();
    const city = this.cityFilter().toLowerCase().trim();
    const tech = this.techFilter().toLowerCase().trim();
    const availability = this.availabilityFilter();

    return allExperts.filter(expert => {
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

      // Filtre par disponibilité
      if (availability !== 'Tous') {
        const availabilityLower = availability.toLowerCase();
        const hasAvailability = expert.availability.types.some(type =>
          type.toLowerCase() === availabilityLower
        );
        if (!hasAvailability) return false;
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

  protected onAvailabilityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.availabilityFilter.set(target.value);
  }

  protected onHireExpert(expertId: string): void {
    // Naviguer vers la page de détails de l'expert
    this.router.navigate(['/expert', expertId]);
  }

  // Helper pour obtenir le nom complet
  protected getFullName(expert: Expert): string {
    return `${expert.firstName} ${expert.lastName}`;
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
}
