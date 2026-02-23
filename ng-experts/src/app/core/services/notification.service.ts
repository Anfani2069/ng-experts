import { Injectable, inject, signal, computed, effect } from '@angular/core';
import {
  collection,
  doc,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { firebase } from '@core/config/firebase.config';
import { AppNotification } from '@core/models/user.model';
import { Auth } from '@core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private auth = inject(Auth);

  // ── State réactif ──────────────────────────────────────────────────────────
  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadMessages = signal<number>(0);

  readonly unreadNotifications = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  private unsubNotifs?: () => void;
  private unsubConvs?: () => void;
  private initialized = false;

  constructor() {
    effect(() => {
      const user = this.auth.getCurrentUser()();
      if (user && !this.initialized) {
        this.initialized = true;
        this.listenNotifications(user.id);
        this.listenUnreadMessages(user.id);
      }
      if (!user && this.initialized) {
        this.initialized = false;
        this.unsubNotifs?.();
        this.unsubConvs?.();
        this.notifications.set([]);
        this.unreadMessages.set(0);
      }
    });
  }

  // ── Écoute temps réel ──────────────────────────────────────────────────────

  private listenNotifications(userId: string): void {
    // Sans orderBy pour éviter l'index composite Firestore — tri côté client
    const q = query(
      collection(firebase.firestore, 'notifications'),
      where('userId', '==', userId),
      limit(50)
    );
    this.unsubNotifs = onSnapshot(q, (snap) => {
      const notifs: AppNotification[] = snap.docs
        .map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: this.toDate(d.data()['createdAt'])
        } as AppNotification))
        .sort((a, b) => {
          const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return tb - ta;
        });
      this.notifications.set(notifs);
    }, err => console.error('Erreur écoute notifications:', err));
  }

  private listenUnreadMessages(userId: string): void {
    const q = query(
      collection(firebase.firestore, 'conversations'),
      where('participantIds', 'array-contains', userId)
    );
    this.unsubConvs = onSnapshot(q, (snap) => {
      let total = 0;
      snap.docs.forEach(d => {
        total += d.data()['unreadCount']?.[userId] || 0;
      });
      this.unreadMessages.set(total);
    }, err => console.error('Erreur écoute messages non lus:', err));
  }

  // ── Créer des notifications ────────────────────────────────────────────────

  /**
   * Méthode interne — construit le document sans undefined avant l'envoi
   */
  private async pushNotif(data: {
    userId: string;
    type: AppNotification['type'];
    title: string;
    body: string;
    link?: string;
    refId?: string;
    fromName?: string;
    fromAvatar?: string;
  }): Promise<void> {
    try {
      const doc_data: Record<string, any> = {
        userId:    data.userId,
        type:      data.type,
        title:     data.title,
        body:      data.body,
        read:      false,
        createdAt: serverTimestamp()
      };
      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (data.link)       doc_data['link']       = data.link;
      if (data.refId)      doc_data['refId']       = data.refId;
      if (data.fromName)   doc_data['fromName']    = data.fromName;
      if (data.fromAvatar) doc_data['fromAvatar']  = data.fromAvatar;

      await addDoc(collection(firebase.firestore, 'notifications'), doc_data);
    } catch (e) {
      console.error('Erreur création notification:', e);
      throw e; // Re-throw pour que l'appelant puisse logger
    }
  }

  async notifyNewProposal(expertId: string, recruiterName: string, proposalTitle: string, proposalId: string): Promise<void> {
    await this.pushNotif({
      userId:   expertId,
      type:     'proposal',
      title:    'Nouvelle proposition reçue',
      body:     `${recruiterName} vous a envoyé une proposition : "${proposalTitle}"`,
      link:     '/missions',
      refId:    proposalId,
      fromName: recruiterName
    });
  }

  async notifyProposalAccepted(recruiterId: string, expertName: string, proposalTitle: string, proposalId: string): Promise<void> {
    await this.pushNotif({
      userId:   recruiterId,
      type:     'proposal_accepted',
      title:    'Proposition acceptée ! 🎉',
      body:     `${expertName} a accepté votre proposition : "${proposalTitle}"`,
      link:     '/recruiter/missions',
      refId:    proposalId,
      fromName: expertName
    });
  }

  async notifyProposalRejected(recruiterId: string, expertName: string, proposalTitle: string, proposalId: string): Promise<void> {
    await this.pushNotif({
      userId:   recruiterId,
      type:     'proposal_rejected',
      title:    'Proposition refusée',
      body:     `${expertName} a refusé votre proposition : "${proposalTitle}"`,
      link:     '/recruiter/missions',
      refId:    proposalId,
      fromName: expertName
    });
  }

  async notifyMissionCompleted(recruiterId: string, expertName: string, proposalTitle: string, proposalId: string): Promise<void> {
    await this.pushNotif({
      userId:   recruiterId,
      type:     'mission_completed',
      title:    'Mission terminée ✅',
      body:     `${expertName} a clôturé la mission : "${proposalTitle}"`,
      link:     '/recruiter/missions',
      refId:    proposalId,
      fromName: expertName
    });
  }

  async notifyNewMessage(recipientId: string, senderName: string, messagePreview: string, conversationId: string, senderAvatar?: string): Promise<void> {
    await this.pushNotif({
      userId:      recipientId,
      type:        'message',
      title:       `Message de ${senderName}`,
      body:        messagePreview.length > 80 ? messagePreview.substring(0, 80) + '...' : messagePreview,
      link:        '/messages',
      refId:       conversationId,
      fromName:    senderName,
      fromAvatar:  senderAvatar
    });
  }

  // ── Marquer comme lu ───────────────────────────────────────────────────────

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(firebase.firestore, 'notifications', notificationId), { read: true });
    } catch (e) {
      console.error('Erreur markAsRead:', e);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(firebase.firestore, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snap = await getDocs(q);
      if (snap.empty) return;
      const batch = writeBatch(firebase.firestore);
      snap.docs.forEach(d => batch.update(d.ref, { read: true }));
      await batch.commit();
    } catch (e) {
      console.error('Erreur markAllAsRead:', e);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private toDate(v: any): Date {
    if (!v) return new Date();
    if (v instanceof Date) return v;
    if (v instanceof Timestamp) return v.toDate();
    if (typeof v === 'object' && 'seconds' in v) return new Date(v.seconds * 1000);
    return new Date(v);
  }

  getTypeIcon(type: AppNotification['type']): string {
    switch (type) {
      case 'message':            return 'fa-solid fa-message';
      case 'proposal':           return 'fa-solid fa-paper-plane';
      case 'proposal_accepted':  return 'fa-solid fa-circle-check';
      case 'proposal_rejected':  return 'fa-solid fa-circle-xmark';
      case 'mission_completed':  return 'fa-solid fa-flag-checkered';
      case 'system':             return 'fa-solid fa-bell';
    }
  }

  getTypeColor(type: AppNotification['type']): string {
    switch (type) {
      case 'message':            return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'proposal':           return 'text-primary bg-primary/10 border-primary/20';
      case 'proposal_accepted':  return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'proposal_rejected':  return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'mission_completed':  return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'system':             return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  }

  formatDate(value: any): string {
    const d = value instanceof Date ? value : this.toDate(value);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'À l\'instant';
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7)  return `Il y a ${days}j`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
}
