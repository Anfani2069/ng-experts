import { ChangeDetectionStrategy, Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Expert } from '@core/models/user.model';
import { ExpertService } from '@core/services/expert.service';
import { LanguageService } from '@core/services/language.service';
import { Auth } from '@core/services/auth.service';

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
  private readonly auth = inject(Auth);
  protected readonly lang = inject(LanguageService);

  protected readonly savedExpertIds = signal<string[]>([]);
  protected readonly isRecruiter = computed(() => this.auth.getCurrentUser()()?.role === 'recruiter');

  // Filtres
  protected readonly cityFilter = signal('');
  protected readonly techFilter = signal('');
  protected readonly selectedAvailabilityTypes = signal<string[]>([]);

  // Types de disponibilité disponibles
  protected readonly availabilityTypes = [
    { value: 'freelance', label: 'Freelance' },
    { value: 'consulting', label: 'Conférence' },
    { value: 'mentoring', label: 'Mentoring' },
    { value: 'cdi', label: 'CDI' },
  ];

  // Données des experts depuis Firebase
  protected readonly experts = this.expertService.expertsData;
  protected readonly isLoading = this.expertService.loading;
  protected readonly error = this.expertService.errorMessage;

  // Pagination
  protected readonly displayCount = signal(12);

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

      // Filtre par ville ou pays
      if (city && !expert.city.toLowerCase().includes(city) && !expert.location.toLowerCase().includes(city)) {
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

  protected readonly visibleExperts = computed(() =>
    this.filteredExperts().slice(0, this.displayCount())
  );

  protected readonly hasMore = computed(() =>
    this.filteredExperts().length > this.displayCount()
  );

  protected readonly remainingCount = computed(() =>
    Math.min(12, this.filteredExperts().length - this.displayCount())
  );

  async ngOnInit() {
    await this.expertService.getAllExperts();
    const user = this.auth.getCurrentUser()();
    if (user?.role === 'recruiter') {
      const ids = await this.expertService.getSavedExpertIds(user.id);
      this.savedExpertIds.set(ids);
    }
  }

  protected onCityFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.cityFilter.set(target.value);
    this.displayCount.set(12);
  }

  protected onTechFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.techFilter.set(target.value);
    this.displayCount.set(12);
  }

  protected toggleAvailabilityType(type: string): void {
    const current = this.selectedAvailabilityTypes();
    if (current.includes(type)) {
      this.selectedAvailabilityTypes.set(current.filter(t => t !== type));
    } else {
      this.selectedAvailabilityTypes.set([...current, type]);
    }
    this.displayCount.set(12);
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

  protected async toggleFavorite(expertId: string, event: Event): Promise<void> {
    event.stopPropagation();
    const user = this.auth.getCurrentUser()();
    if (!user || user.role !== 'recruiter') return;
    const isSaved = await this.expertService.toggleSavedExpert(user.id, expertId);
    if (isSaved) {
      this.savedExpertIds.update(ids => [...ids, expertId]);
    } else {
      this.savedExpertIds.update(ids => ids.filter(id => id !== expertId));
    }
  }

  protected isFavorited(expertId: string): boolean {
    return this.savedExpertIds().includes(expertId);
  }

  protected onLoadMore(): void {
    this.displayCount.update(n => n + 12);
  }

  protected getAvailabilityTypeStyle(type: string): { label: string; classes: string } {
    const map: Record<string, { label: string; classes: string }> = {
      freelance:  { label: 'Freelance',  classes: 'bg-primary/15 text-primary border-primary/30' },
      consulting: { label: 'Consulting', classes: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
      mentoring:  { label: 'Mentoring',  classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
      cdi:        { label: 'CDI',        classes: 'bg-green-500/15 text-green-400 border-green-500/30' },
      cdd:        { label: 'CDD',        classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    };
    return map[type] ?? { label: type, classes: 'bg-white/5 text-subtext border-white/10' };
  }

  protected getLoadMoreLabel(): string {
    const count = this.remainingCount();
    const plural = count > 1 ? 's' : '';
    return this.lang.t('features.loadMore')
      .replace('{{count}}', String(count))
      .replace('{{plural}}', plural);
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
