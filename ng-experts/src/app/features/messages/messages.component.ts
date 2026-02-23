import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  computed,
  OnDestroy,
  ViewChild,
  ElementRef,
  effect
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardLayout } from '@shared/components/dashboard-layout/dashboard-layout.component';
import { Auth } from '@core/services/auth.service';
import { MessagingService } from '@core/services/messaging.service';
import { Conversation, ChatMessage } from '@core/models/user.model';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardLayout, FormsModule, RouterModule, DatePipe]
})
export class Messages implements OnDestroy {
  private auth = inject(Auth);
  private messaging = inject(MessagingService);

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  protected readonly currentUser = this.auth.getCurrentUser();
  protected readonly isLoadingConvs = signal(true);
  protected readonly conversations = signal<Conversation[]>([]);
  protected readonly activeConversation = signal<Conversation | null>(null);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly newMessage = signal('');
  protected readonly isSending = signal(false);
  protected readonly searchQuery = signal('');

  protected readonly filteredConversations = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.conversations();
    return this.conversations().filter(c => {
      const other = this.getOtherParticipant(c);
      return other?.name.toLowerCase().includes(q);
    });
  });

  protected readonly totalUnread = computed(() => {
    const user = this.currentUser();
    if (!user) return 0;
    return this.messaging.getTotalUnread(this.conversations(), user.id);
  });

  private unsubConversations?: () => void;
  private unsubMessages?: () => void;
  private initialized = false;

  constructor() {
    // Utiliser un effect pour démarrer l'écoute dès que l'utilisateur est chargé
    effect(() => {
      const user = this.currentUser();
      if (user && !this.initialized) {
        this.initialized = true;
        this.loadConversations(user.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubConversations?.();
    this.unsubMessages?.();
  }

  private loadConversations(userId: string): void {
    this.isLoadingConvs.set(true);
    this.unsubConversations = this.messaging.listenToConversations(userId, (convs) => {
      this.conversations.set(convs);
      this.isLoadingConvs.set(false);
      // Mettre à jour la conversation active si elle est ouverte
      const active = this.activeConversation();
      if (active) {
        const updated = convs.find(c => c.id === active.id);
        if (updated) this.activeConversation.set(updated);
      }
    });
  }

  private loadMessages(conversationId: string): void {
    this.unsubMessages?.();
    this.unsubMessages = this.messaging.listenToMessages(conversationId, (msgs) => {
      this.messages.set(msgs);
      this.scrollToBottom();
    });
  }

  protected selectConversation(conv: Conversation): void {
    this.activeConversation.set(conv);
    this.messages.set([]);
    this.loadMessages(conv.id!);
    const user = this.currentUser();
    if (user) this.messaging.markAsRead(conv.id!, user.id);
  }

  protected async sendMessage(): Promise<void> {
    const content = this.newMessage().trim();
    const user = this.currentUser();
    const conv = this.activeConversation();
    if (!content || !user || !conv || this.isSending()) return;

    this.isSending.set(true);
    this.newMessage.set('');
    try {
      await this.messaging.sendMessage(conv.id!, user.id, `${user.firstName} ${user.lastName}`, content, user.avatar);
      this.scrollToBottom();
    } catch (e) {
      console.error('Erreur envoi message:', e);
      this.newMessage.set(content); // Restaurer le message en cas d'erreur
    } finally {
      this.isSending.set(false);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  protected onSearch(e: Event): void {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  protected closeConversation(): void {
    this.activeConversation.set(null);
    this.messages.set([]);
    this.unsubMessages?.();
  }

  protected getOtherParticipant(conv: Conversation): { name: string; avatar?: string; role: string } | null {
    const user = this.currentUser();
    if (!user || !conv.participants) return null;
    const otherId = conv.participantIds.find(id => id !== user.id);
    return otherId ? conv.participants[otherId] : null;
  }

  protected getInitialAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '?')}&background=EC4899&color=fff&size=128`;
  }

  protected isMyMessage(msg: ChatMessage): boolean {
    return msg.senderId === this.currentUser()?.id;
  }

  protected getUnreadCount(conv: Conversation): number {
    const user = this.currentUser();
    if (!user) return 0;
    return conv.unreadCount?.[user.id] || 0;
  }

  protected toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'object' && 'seconds' in value) return new Date(value.seconds * 1000);
    return null;
  }

  protected formatMsgDate(value: any): string {
    const d = this.toDate(value);
    if (!d) return '';
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}j`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 60);
  }
}
