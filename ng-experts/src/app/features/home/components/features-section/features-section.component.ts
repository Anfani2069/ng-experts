import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScroll } from '@shared/directives/animate-on-scroll.directive';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-features-section',
  templateUrl: './features-section.component.html',
  styleUrls: ['./features-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AnimateOnScroll]
})
export class FeaturesSection {
  protected readonly lang = inject(LanguageService);
}
