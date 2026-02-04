import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSection } from './components/hero-section/hero-section.component';
import { CompaniesSection } from './components/companies-section/companies-section.component';
import { ExpertsSection } from './components/experts-section/experts-section.component';
import { FeaturesSection } from './components/features-section/features-section.component';
import { CtaSection } from './components/cta-section/cta-section.component';

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
    CtaSection
  ]
})
export class Home {
}
