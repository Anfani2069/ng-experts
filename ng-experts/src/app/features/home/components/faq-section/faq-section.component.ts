import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq-section',
  templateUrl: './faq-section.component.html',
  styleUrls: ['./faq-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class FaqSection {
  protected readonly openIndex = signal<number | null>(null);

  protected readonly faqs: FaqItem[] = [
    {
      question: 'Ng-experts est-il gratuit pour les experts ?',
      answer: 'Oui, la création de profil et la visibilité sur la plateforme sont entièrement gratuites pour les experts Angular. Vous pouvez créer votre profil, mettre en avant vos compétences et recevoir des propositions de missions sans aucun frais.'
    },
    {
      question: 'Comment puis-je postuler à une mission ?',
      answer: 'Il suffit de créer votre profil expert, de renseigner vos compétences et votre disponibilité, puis de consulter les missions disponibles. Les recruteurs peuvent également vous contacter directement en fonction de votre profil. La mise en relation se fait via notre messagerie intégrée.'
    },
    {
      question: 'Les experts sont-ils vraiment vérifiés ?',
      answer: 'Absolument. Chaque profil expert passe par un processus de vérification manuelle par notre équipe. Nous validons les compétences déclarées, les références professionnelles et l\'expérience Angular avant de publier le profil sur la plateforme.'
    },
    {
      question: 'Comment les entreprises peuvent-elles publier une offre ?',
      answer: 'Il suffit de créer un compte recruteur, de renseigner les informations de votre entreprise et de publier votre besoin. Notre algorithme de matching vous proposera automatiquement les profils les plus adaptés à vos critères. Vous pouvez aussi parcourir vous-même notre réseau d\'experts.'
    },
    {
      question: 'Quels types de missions sont disponibles ?',
      answer: 'Ng-experts couvre tous les types d\'engagement : missions freelance ponctuelles, consulting long terme, CDI, mentoring et conférences. Chaque expert indique ses préférences sur son profil, ce qui vous permet de filtrer selon votre besoin.'
    },
    {
      question: 'Quels sont les délais pour trouver un expert ?',
      answer: 'Notre réseau compte 150+ experts actifs, avec un délai de réponse moyen de 24h. Pour les besoins urgents, notre équipe peut intervenir directement pour accélérer la mise en relation et vous proposer des profils pré-qualifiés sous quelques heures.'
    },
    {
      question: 'Ng-experts couvre-t-il uniquement Angular ?',
      answer: 'Ng-experts est spécialisé dans l\'écosystème Angular et TypeScript : Angular, RxJS, NgRx, NestJS, Ionic, et plus encore. Cette spécialisation nous permet de garantir un niveau d\'expertise élevé et des profils réellement qualifiés, contrairement aux plateformes généralistes.'
    },
    {
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Oui, la sécurité de vos données est notre priorité. Nous sommes conformes au RGPD et utilisons des infrastructures sécurisées. Vos données personnelles ne sont jamais revendues à des tiers et vous gardez le contrôle total sur la visibilité de votre profil.'
    }
  ];

  protected toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }

  protected isOpen(index: number): boolean {
    return this.openIndex() === index;
  }
}
