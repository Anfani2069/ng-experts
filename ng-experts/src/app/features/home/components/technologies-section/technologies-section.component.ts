import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-technologies-section',
  templateUrl: './technologies-section.component.html',
  styleUrls: ['./technologies-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class TechnologiesSection {
  protected readonly technologies = [
    { name: 'Angular',     icon: 'fa-brands fa-angular',   color: '#DD0031' },
    { name: 'TypeScript',  icon: 'fa-solid fa-code',       color: '#3178C6' },
    { name: 'RxJS',        icon: 'fa-solid fa-circle-nodes', color: '#B7178C' },
    { name: 'NgRx',        icon: 'fa-solid fa-database',   color: '#BA2BD2' },
    { name: 'Node.js',     icon: 'fa-brands fa-node-js',   color: '#339933' },
    { name: 'Firebase',    icon: 'fa-solid fa-fire',       color: '#FFCA28' },
    { name: 'Nx',          icon: 'fa-solid fa-cubes',      color: '#143055' },
    { name: 'Ionic',       icon: 'fa-solid fa-mobile-screen', color: '#3880FF' },
    { name: 'Jest',        icon: 'fa-solid fa-vial',       color: '#C21325' },
    { name: 'Cypress',     icon: 'fa-solid fa-check-double', color: '#17202C' },
    { name: 'TailwindCSS', icon: 'fa-brands fa-css3-alt',  color: '#06B6D4' },
    { name: 'GraphQL',     icon: 'fa-solid fa-diagram-project', color: '#E10098' },
  ];
}
