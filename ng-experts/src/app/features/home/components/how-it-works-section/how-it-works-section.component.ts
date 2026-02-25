import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-it-works-section',
  templateUrl: './how-it-works-section.component.html',
  styleUrls: ['./how-it-works-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class HowItWorksSection {
  protected readonly steps = [
    {
      number: '01',
      icon: 'fa-solid fa-user-plus',
      title: 'Créez votre compte',
      description: 'Inscrivez-vous en tant que recruteur ou expert Angular en quelques secondes. Aucune carte bancaire requise.',
      detail: 'Gratuit pour commencer'
    },
    {
      number: '02',
      icon: 'fa-solid fa-magnifying-glass',
      title: 'Recherchez & filtrez',
      description: 'Parcourez notre réseau d\'experts vérifiés. Filtrez par ville, technologie, disponibilité et TJM.',
      detail: '150+ experts disponibles'
    },
    {
      number: '03',
      icon: 'fa-solid fa-comments',
      title: 'Contactez directement',
      description: 'Envoyez une proposition de mission à l\'expert de votre choix via notre messagerie intégrée.',
      detail: 'Réponse sous 24h'
    },
    {
      number: '04',
      icon: 'fa-solid fa-rocket',
      title: 'Lancez votre projet',
      description: 'Collaborez avec les meilleurs talents Angular et démarrez votre mission dans les meilleurs délais.',
      detail: 'Mission lancée !'
    }
  ];
}
