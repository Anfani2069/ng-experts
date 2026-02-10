import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '@shared/components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-messages',
  template: `
    <app-dashboard-layout [pageTitle]="'Messages'" [pageSubtitle]="'Communiquer avec les recruteurs et experts'" [showSearch]="false">
      <div class="p-8">
        <div class="bg-white rounded-3xl p-8 shadow-xl">
          <div class="text-center py-16">
            <div class="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fa-solid fa-message text-white text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Module Messages</h2>
            <p class="text-gray-600 max-w-md mx-auto">
              Communiquez en temps réel avec les recruteurs et autres experts. Gérez vos conversations et négociations.
            </p>
            <div class="mt-8">
              <span class="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full font-semibold">
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
export class Messages {}
