import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScroll } from '@shared/directives/animate-on-scroll.directive';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-how-it-works-section',
  templateUrl: './how-it-works-section.component.html',
  styleUrls: ['./how-it-works-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AnimateOnScroll]
})
export class HowItWorksSection {
  protected readonly lang = inject(LanguageService);

  protected readonly steps = computed(() => this.lang.get<Array<{title:string;description:string;detail:string}>>('howItWorks.steps').map((s, i) => ({
    ...s,
    number: ['01','02','03','04'][i],
    icon: ['fa-solid fa-user-plus','fa-solid fa-magnifying-glass','fa-solid fa-comments','fa-solid fa-rocket'][i]
  })));

}
