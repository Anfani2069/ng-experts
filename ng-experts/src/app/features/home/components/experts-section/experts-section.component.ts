import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Expert {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  reviews: number;
  description: string;
  skills: string[];
  availability: string[];
  isVerified: boolean;
  isSpeaker?: boolean;
}

@Component({
  selector: 'app-experts-section',
  templateUrl: './experts-section.component.html',
  styleUrls: ['./experts-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class ExpertsSection {
  protected readonly cityFilter = signal('');
  protected readonly techFilter = signal('');
  protected readonly availabilityFilter = signal('Tous');

  protected readonly experts: Expert[] = [
    {
      id: 1,
      name: 'Camille Coutens',
      location: 'Bordeaux',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 5.0,
      reviews: 24,
      description: 'Développeuse Vue.js / Nuxt + CTO @augalo @augocel @aucode @auciono Kiffer avant tout.',
      skills: ['Vue.js', 'Nuxt', 'Ionic'],
      availability: ['Freelance'],
      isVerified: true
    },
    {
      id: 2,
      name: 'Dina Ramarovahoaka',
      location: 'Bordeaux',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
      rating: 4.9,
      reviews: 18,
      description: 'Bonjour, je m\'appelle Dina, 40 ans, développeuse frontend passionnée ! J\'habite à bordeaux et je suis spécialisée en Angular.',
      skills: ['Angular', 'React'],
      availability: ['Freelance', 'CDI'],
      isVerified: true
    },
    {
      id: 3,
      name: 'Natacha',
      location: 'Lille',
      avatar: 'https://randomuser.me/api/portraits/women/46.jpg',
      rating: 4.8,
      reviews: 31,
      description: 'Hello, Moi c\'est Natacha, je suis développeuse Fullstack sur des stacks JS / TS, principalement Angular et Node.js.',
      skills: ['Angular', 'Next.JS', 'MongoDB'],
      availability: ['Freelance'],
      isVerified: true
    },
    {
      id: 4,
      name: 'Brenda Meunier',
      location: 'Mende',
      avatar: 'https://randomuser.me/api/portraits/women/47.jpg',
      rating: 4.7,
      reviews: 42,
      description: 'Développeuse full-stack spécialisée en Angular (v2 -> v20) et Python (Django, FastAPI). J\'interviens sur des projets complexes.',
      skills: ['Angular', 'TypeScript', 'RxJS'],
      availability: ['Freelance', 'CDI'],
      isVerified: true
    },
    {
      id: 5,
      name: 'Manon Carbonnel',
      location: 'Nantes',
      avatar: 'https://randomuser.me/api/portraits/men/48.jpg',
      rating: 4.9,
      reviews: 67,
      description: 'Développeuse web | Software crafter | Agiliste | Yesss Leader | Fresqueuse | Experte en intégration continue.',
      skills: ['TypeScript', 'CSS', 'PHP'],
      availability: ['Freelance', 'CDI'],
      isVerified: true,
      isSpeaker: true
    },
    {
      id: 6,
      name: 'Emmanuelle ABOAF',
      location: 'Paris',
      avatar: 'https://randomuser.me/api/portraits/women/49.jpg',
      rating: 5.0,
      reviews: 89,
      description: 'Sourde de naissance et bilingue avec deux implants cochléaires, je suis développeuse, coach et conférencière passionnée.',
      skills: ['Angular', 'React', 'Vue.JS'],
      availability: ['CDI'],
      isVerified: true,
      isSpeaker: true
    }
  ];

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

  protected onHireExpert(expertId: number): void {
    // TODO: Implement hire expert functionality
    console.log('Hire expert:', expertId);
  }
}
