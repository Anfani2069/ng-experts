import { Injectable, inject } from '@angular/core';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { firebase } from '@core/config/firebase.config';
import { Conversation, ChatMessage } from '@core/models/user.model';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private notifService = inject(NotificationService);

  // ── Helpers ────────────────────────────────────────────────────────────────

  private toDate(v: any): Date {
    if (!v) return new Date();
    if (v instanceof Date) return v;
    if (v instanceof Timestamp) return v.toDate();
    if (typeof v === 'object' && 'seconds' in v) return new Date(v.seconds * 1000);
    return new Date(v);
  }

  private mapConversation(id: string, data: any): Conversation {
    return { id, ...data, lastMessageAt: this.toDate(data.lastMessageAt), createdAt: this.toDate(data.createdAt) } as Conversation;
  }

  private mapMessage(id: string, data: any): ChatMessage {
    return { id, ...data, createdAt: this.toDate(data.createdAt) } as ChatMessage;
  }

  // ── Conversations ──────────────────────────────────────────────────────────

  /**
   * Récupère ou crée une conversation entre deux utilisateurs
   */
  async getOrCreateConversation(
    currentUserId: string,
    otherUserId: string,
    currentUserInfo: { name: string; avatar?: string; role: 'expert' | 'recruiter' },
    otherUserInfo:   { name: string; avatar?: string; role: 'expert' | 'recruiter' },
    proposalId?: string,
    proposalTitle?: string
  ): Promise<string> {
    if (!otherUserId) throw new Error('otherUserId est requis pour créer une conversation');

    // Chercher une conversation existante
    const convsRef = collection(firebase.firestore, 'conversations');
    const q = query(convsRef, where('participantIds', 'array-contains', currentUserId));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      if ((d.data()['participantIds'] as string[]).includes(otherUserId)) {
        return d.id;
      }
    }

    // Construire le document proprement sans undefined
    const participants: Record<string, { name: string; avatar: string | null; role: string }> = {
      [currentUserId]: {
        name: currentUserInfo.name,
        avatar: currentUserInfo.avatar ?? null,
        role: currentUserInfo.role
      },
      [otherUserId]: {
        name: otherUserInfo.name,
        avatar: otherUserInfo.avatar ?? null,
        role: otherUserInfo.role
      }
    };

    const newConvData: Record<string, any> = {
      participantIds: [currentUserId, otherUserId],
      participants,
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      lastMessageSenderId: null,
      unreadCount: { [currentUserId]: 0, [otherUserId]: 0 },
      createdAt: serverTimestamp()
    };

    // Ajouter champs optionnels seulement s'ils existent
    if (proposalId)    newConvData['proposalId']    = proposalId;
    if (proposalTitle) newConvData['proposalTitle'] = proposalTitle;

    const ref = await addDoc(convsRef, newConvData);
    return ref.id;
  }

  /**
   * Écoute en temps réel les conversations d'un utilisateur
   * Utilise seulement where() pour éviter le besoin d'index composite
   */
  listenToConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
    const q = query(
      collection(firebase.firestore, 'conversations'),
      where('participantIds', 'array-contains', userId)
    );

    return onSnapshot(q, (snap) => {
      // Trier côté client par lastMessageAt pour éviter l'index composite Firestore
      const convs = snap.docs
        .map(d => this.mapConversation(d.id, d.data()))
        .sort((a, b) => {
          const ta = a.lastMessageAt instanceof Date ? a.lastMessageAt.getTime() : 0;
          const tb = b.lastMessageAt instanceof Date ? b.lastMessageAt.getTime() : 0;
          return tb - ta;
        });
      callback(convs);
    }, (err) => {
      console.error('Erreur écoute conversations:', err);
      callback([]);
    });
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  /**
   * Écoute en temps réel les messages d'une conversation
   */
  listenToMessages(conversationId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const q = query(
      collection(firebase.firestore, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => this.mapMessage(d.id, d.data())));
    }, (err) => {
      console.error('Erreur écoute messages:', err);
    });
  }

  /**
   * Envoie un message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    senderAvatar?: string
  ): Promise<void> {
    if (!content.trim()) return;

    const batch = writeBatch(firebase.firestore);

    // Message
    const msgRef = doc(collection(firebase.firestore, 'conversations', conversationId, 'messages'));
    batch.set(msgRef, {
      conversationId,
      senderId,
      senderName,
      senderAvatar: senderAvatar ?? null,
      content: content.trim(),
      createdAt: serverTimestamp(),
      read: false
    });

    // Mise à jour conversation
    const convRef = doc(firebase.firestore, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);
    if (convSnap.exists()) {
      const participantIds: string[] = convSnap.data()['participantIds'] || [];
      const unreadUpdate: Record<string, any> = {};
      participantIds.forEach(pid => {
        if (pid !== senderId) unreadUpdate[`unreadCount.${pid}`] = increment(1);
      });
      batch.update(convRef, {
        lastMessage: content.trim().substring(0, 100),
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: senderId,
        ...unreadUpdate
      });
    }

    await batch.commit();

    // Notifier les autres participants
    if (convSnap.exists()) {
      const data = convSnap.data();
      const participantIds: string[] = data['participantIds'] || [];
      const preview = content.trim().substring(0, 80);
      for (const pid of participantIds) {
        if (pid !== senderId) {
          try {
            await this.notifService.notifyNewMessage(pid, senderName, preview, conversationId, senderAvatar);
          } catch (e) { console.warn('Notif message failed:', e); }
        }
      }
    }
  }

  /**
   * Marque les messages d'une conv comme lus pour un utilisateur
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(firebase.firestore, 'conversations', conversationId), {
        [`unreadCount.${userId}`]: 0
      });
    } catch (e) {
      console.error('Erreur markAsRead:', e);
    }
  }

  /**
   * Retourne le nombre total de messages non lus pour un utilisateur
   */
  getTotalUnread(conversations: Conversation[], userId: string): number {
    return conversations.reduce((acc, c) => acc + (c.unreadCount?.[userId] || 0), 0);
  }
}
