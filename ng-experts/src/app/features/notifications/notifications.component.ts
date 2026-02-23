import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardLayout } from '@shared/components/dashboard-layout/dashboard-layout.component';
import { NotificationService } from '@core/services/notification.service';
import { Auth } from '@core/services/auth.service';
import { AppNotification } from '@core/models/user.model';

@Component({
  selector: 'app-notifications',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardLayout, RouterModule],
  template: `
<app-dashboard-layout [pageTitle]="'Notifications'" [pageSubtitle]="'Vos alertes en temps réel'" [showSearch]="false">
  <div class="px-4 md:px-8 py-6 bg-heroBg min-h-full">

    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h2 class="text-xl font-bold text-white">Notifications</h2>
        @if (unreadCount() > 0) {
          <span class="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/30">
            {{ unreadCount() }} non lue{{ unreadCount() > 1 ? 's' : '' }}
          </span>
        }
      </div>
      @if (unreadCount() > 0) {
        <button (click)="markAllRead()"
          class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-subtext hover:text-primary transition px-3 py-2 rounded-lg hover:bg-white/5">
          <i class="fa-solid fa-check-double text-xs"></i> Tout marquer comme lu
        </button>
      }
    </div>

    <div class="flex gap-2 mb-6 flex-wrap">
      @for (f of filters; track f.key) {
        <button (click)="setFilter($any(f.key))"
          [ngClass]="activeFilter() === f.key
            ? 'bg-primary text-white border-primary'
            : 'bg-white/5 text-subtext border-white/10 hover:border-primary/30 hover:text-white'"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all">
          <i [class]="f.icon + ' text-[10px]'"></i>
          {{ f.label }}
          @if (f.key === 'unread' && unreadCount() > 0) {
            <span class="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[9px]">{{ unreadCount() }}</span>
          }
        </button>
      }
    </div>

    <div class="space-y-2">
      @if (notifService.notifications().length === 0) {
        <div class="bg-[#1a1a1a] border border-white/5 rounded-2xl p-16 text-center">
          <div class="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <i class="fa-solid fa-bell text-primary text-2xl"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Aucune notification</h3>
          <p class="text-subtext text-sm max-w-xs mx-auto">Vous recevrez des notifications lors de nouvelles propositions ou messages.</p>
        </div>
      } @else if (filtered().length === 0) {
        <div class="bg-[#1a1a1a] border border-white/5 rounded-2xl p-12 text-center">
          <i class="fa-solid fa-filter text-subtext text-3xl mb-3 opacity-30 block"></i>
          <p class="text-subtext text-sm">Aucune notification dans cette catégorie</p>
        </div>
      } @else {
        @for (notif of filtered(); track notif.id) {
          <div (click)="onNotifClick(notif)"
            [ngClass]="notif.read ? 'bg-[#1a1a1a] border-white/5' : 'bg-[#1e1a2e] border-primary/20'"
            class="flex gap-4 p-4 rounded-xl border cursor-pointer hover:border-primary/30 hover:bg-white/[0.04] transition-all group">
            <div class="shrink-0 mt-0.5">
              <div [ngClass]="getColor(notif.type)" class="w-10 h-10 rounded-xl border flex items-center justify-center">
                <i [class]="getIcon(notif.type) + ' text-sm'"></i>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3 mb-1">
                <p class="font-semibold text-sm leading-snug" [ngClass]="notif.read ? 'text-white/70' : 'text-white'">{{ notif.title }}</p>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-[10px] text-subtext whitespace-nowrap">{{ formatDate(notif.createdAt) }}</span>
                  @if (!notif.read) { <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span> }
                </div>
              </div>
              <p class="text-xs text-subtext line-clamp-2 mb-2">{{ notif.body }}</p>
              @if (notif.link) {
                <div class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary/60 group-hover:text-primary transition">
                  <span>Voir</span><i class="fa-solid fa-arrow-right text-[9px] ml-1"></i>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  </div>
</app-dashboard-layout>
  `
})
export class Notifications {
  readonly notifService = inject(NotificationService);
  private auth = inject(Auth);
  private router = inject(Router);

  readonly currentUser = this.auth.getCurrentUser();
  readonly activeFilter = signal<'all' | 'unread' | 'message' | 'proposal'>('all');

  readonly filters = [
    { key: 'all',      label: 'Toutes',       icon: 'fa-solid fa-bell' },
    { key: 'unread',   label: 'Non lues',     icon: 'fa-solid fa-circle-dot' },
    { key: 'message',  label: 'Messages',     icon: 'fa-solid fa-message' },
    { key: 'proposal', label: 'Propositions', icon: 'fa-solid fa-paper-plane' }
  ] as const;

  readonly filtered = computed(() => {
    const all = this.notifService.notifications();
    const f = this.activeFilter();
    if (f === 'all')     return all;
    if (f === 'unread')  return all.filter(n => !n.read);
    if (f === 'message') return all.filter(n => n.type === 'message');
    return all.filter(n => n.type === 'proposal' || n.type === 'proposal_accepted' || n.type === 'proposal_rejected');
  });

  readonly unreadCount = computed(() => this.notifService.unreadNotifications());

  async onNotifClick(notif: AppNotification): Promise<void> {
    if (!notif.read && notif.id) await this.notifService.markAsRead(notif.id);
    if (notif.link) this.router.navigate([notif.link]);
  }

  async markAllRead(): Promise<void> {
    const user = this.currentUser();
    if (user) await this.notifService.markAllAsRead(user.id);
  }

  setFilter(f: 'all' | 'unread' | 'message' | 'proposal'): void {
    this.activeFilter.set(f);
  }

  getIcon(type: AppNotification['type']): string {
    return this.notifService.getTypeIcon(type);
  }

  getColor(type: AppNotification['type']): string {
    return this.notifService.getTypeColor(type);
  }

  formatDate(v: any): string {
    return this.notifService.formatDate(v);
  }
}
