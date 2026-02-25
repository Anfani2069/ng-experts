import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSection } from './components/hero-section/hero-section.component';
import { CompaniesSection } from './components/companies-section/companies-section.component';
import { ExpertsSection } from './components/experts-section/experts-section.component';
import { FeaturesSection } from './components/features-section/features-section.component';
import { CtaSection } from './components/cta-section/cta-section.component';
import { HowItWorksSection } from './components/how-it-works-section/how-it-works-section.component';
import { WhyNgExpertsSection } from './components/why-ng-experts-section/why-ng-experts-section.component';
import { FaqSection } from './components/faq-section/faq-section.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HeroSection,
    CompaniesSection,
    ExpertsSection,
    FeaturesSection,
    HowItWorksSection,
    WhyNgExpertsSection,
    FaqSection,
    CtaSection
  ]
})
export class Home {
}
