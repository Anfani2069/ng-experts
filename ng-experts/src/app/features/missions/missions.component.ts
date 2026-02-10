import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '@shared/components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-missions',
  template: `
    <app-dashboard-layout [pageTitle]="'Mes Missions'" [pageSubtitle]="'Gérer vos missions et projets'" [showSearch]="false">
      <div class="p-8">
        <div class="bg-white rounded-3xl p-8 shadow-xl">
          <div class="text-center py-16">
            <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fa-solid fa-briefcase text-white text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Module Missions</h2>
            <p class="text-gray-600 max-w-md mx-auto">
              Cette section permettra de gérer vos missions, consulter les offres disponibles et suivre vos projets en cours.
            </p>
            <div class="mt-8">
              <span class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold">
                Bientôt disponible
              </span>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardLayout]
})
export class Missions {}
