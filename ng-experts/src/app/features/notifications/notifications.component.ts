import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '@shared/components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-notifications',
  template: `
    <app-dashboard-layout [pageTitle]="'Notifications'" [pageSubtitle]="'Gérer vos alertes et notifications'" [showSearch]="false">
      <div class="p-8">
        <div class="bg-white rounded-3xl p-8 shadow-xl">
          <div class="text-center py-16">
            <div class="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fa-solid fa-bell text-white text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Module Notifications</h2>
            <p class="text-gray-600 max-w-md mx-auto">
              Recevez et gérez toutes vos notifications : nouvelles missions, messages, mises à jour de profil et alertes importantes.
            </p>
            <div class="mt-8">
              <span class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold">
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
export class Notifications {}
