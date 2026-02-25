import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-why-ng-experts-section',
  templateUrl: './why-ng-experts-section.component.html',
  styleUrls: ['./why-ng-experts-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class WhyNgExpertsSection {
  protected readonly advantages = [
    {
      icon: 'fa-solid fa-shield-halved',
      title: 'Experts 100% vérifiés',
      description: 'Chaque profil est manuellement vérifié par notre équipe. Compétences, références et expériences sont validées avant publication.',
      highlight: 'Zéro mauvaise surprise'
    },
    {
      icon: 'fa-solid fa-bolt',
      title: 'Mise en relation rapide',
      description: 'Recevez des profils qualifiés en moins de 24h. Notre algorithme de matching vous connecte avec les experts les plus adaptés.',
      highlight: 'Réponse sous 24h'
    },
    {
      icon: 'fa-solid fa-layer-group',
      title: 'Spécialisé Angular',
      description: 'Contrairement aux plateformes généralistes, ng-experts est 100% dédié à l\'écosystème Angular, RxJS, NgRx et TypeScript.',
      highlight: 'Niche = expertise'
    },
    {
      icon: 'fa-solid fa-euro-sign',
      title: 'Transparence des tarifs',
      description: 'Chaque expert affiche son TJM directement sur son profil. Pas de surprise, négociez en toute transparence.',
      highlight: 'TJM affiché'
    },
    {
      icon: 'fa-solid fa-comments',
      title: 'Communication directe',
      description: 'Contactez les experts directement sans intermédiaire. Notre messagerie intégrée facilite les échanges et le suivi des missions.',
      highlight: 'Sans intermédiaire'
    },
    {
      icon: 'fa-solid fa-chart-line',
      title: 'Tableau de bord complet',
      description: 'Gérez toutes vos missions, candidatures et communications depuis une interface intuitive et centralisée.',
      highlight: 'Tout en un'
    }
  ];

  protected readonly stats = [
    { value: '150+', label: 'Experts vérifiés' },
    { value: '450+', label: 'Missions réussies' },
    { value: '98%', label: 'Taux de satisfaction' },
    { value: '24h', label: 'Délai de réponse moyen' }
  ];
}
