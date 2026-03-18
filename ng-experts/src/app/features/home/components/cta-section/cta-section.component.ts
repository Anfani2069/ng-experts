import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScroll } from '@shared/directives/animate-on-scroll.directive';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-cta-section',
  templateUrl: './cta-section.component.html',
  styleUrls: ['./cta-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AnimateOnScroll]
})
export class CtaSection {
  protected readonly lang = inject(LanguageService);
  protected onCreateProfile(): void {
    // TODO: Implement navigation to profile creation
    console.log('Create profile clicked');
  }

  protected onLearnMore(): void {
    // TODO: Implement navigation to learn more page
    console.log('Learn more clicked');
  }
}
