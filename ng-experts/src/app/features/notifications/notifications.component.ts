import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '@shared/components/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-notifications',
  template: `
    <app-dashboard-layout [pageTitle]="'Notifications'" [pageSubtitle]="'Gérer vos alertes et notifications'" [showSearch]="false">
      <div class="p-8 bg-heroBg">
        <div class="bg-[#1a1a1a] border border-white/5 rounded-3xl p-8">
          <div class="text-center py-16">
            <div class="w-24 h-24 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fa-solid fa-bell text-primary text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-white mb-4">Module Notifications</h2>
            <p class="text-subtext max-w-md mx-auto">
              Recevez et gérez toutes vos notifications : nouvelles missions, messages, mises à jour de profil et alertes importantes.
            </p>
            <div class="mt-8">
              <span class="px-6 py-3 bg-primary text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-[0_0_20px_-5px_rgba(236,72,153,0.5)]">
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
