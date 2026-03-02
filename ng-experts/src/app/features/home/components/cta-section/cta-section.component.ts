import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScroll } from '@shared/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-cta-section',
  templateUrl: './cta-section.component.html',
  styleUrls: ['./cta-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AnimateOnScroll]
})
export class CtaSection {
  protected onCreateProfile(): void {
    // TODO: Implement navigation to profile creation
    console.log('Create profile clicked');
  }

  protected onLearnMore(): void {
    // TODO: Implement navigation to learn more page
    console.log('Learn more clicked');
  }
}
