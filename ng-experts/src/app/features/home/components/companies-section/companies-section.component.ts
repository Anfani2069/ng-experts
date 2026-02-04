import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-companies-section',
  templateUrl: './companies-section.component.html',
  styleUrls: ['./companies-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class CompaniesSection {
  protected readonly companies = [
    { name: 'Google', icon: 'fa-brands fa-google' },
    { name: 'Microsoft', icon: 'fa-brands fa-microsoft' },
    { name: 'Airbnb', icon: 'fa-brands fa-airbnb' },
    { name: 'Spotify', icon: 'fa-brands fa-spotify' },
    { name: 'Apple', icon: 'fa-brands fa-apple' },
    { name: 'Amazon', icon: 'fa-brands fa-amazon' },
    { name: 'Meta', icon: 'fa-brands fa-meta' },
    { name: 'Netflix', icon: 'fa-brands fa-netflix' }
  ];
}
