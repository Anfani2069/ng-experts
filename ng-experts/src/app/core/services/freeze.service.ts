import { Injectable, inject, signal, computed, NgZone } from '@angular/core';
import {
  collection, doc, getDoc, getDocs, updateDoc, query, where,
  Timestamp, serverTimestamp
} from 'firebase/firestore';
import { firebase } from '@core/config/firebase.config';
import { Auth } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { Expert, Proposal } from '@core/models/user.model';

const RESPONSE_DEADLINE_MS = 60 * 60 * 1000;          // 1 heure
const MAX_STRIKES          = 3;
const FREEZE_DURATION_MS   = 24 * 60 * 60 * 1000;     // 24 heures

@Injectable({ providedIn: 'root' })
export class FreezeService {
  private auth = inject(Auth);
  private notifService = inject(NotificationService);
  private zone = inject(NgZone);

  // ── State ────────────────────────────────────────────────────
  private _freezeStrikes = signal(0);
  private _frozenUntil   = signal<Date | null>(null);
  private _checkInterval: any = null;

  readonly freezeStrikes = this._freezeStrikes.asReadonly();
  readonly frozenUntil   = this._frozenUntil.asReadonly();

  readonly isFrozen = computed(() => {
    const until = this._frozenUntil();
    return until !== null && until.getTime() > Date.now();
  });

  readonly freezeRemainingMs = computed(() => {
    const until = this._frozenUntil();
    if (!until) return 0;
    return Math.max(0, until.getTime() - Date.now());
  });

  // ── Initialisation (appelé après chargement user) ──────────

  /**
   * Charge l'état de gel depuis le profil expert et lance le check périodique
   */
  async init(expert: Expert): Promise<void> {
    this._freezeStrikes.set(expert.freezeStrikes || 0);
    const frozenUntil = this.toDate(expert.frozenUntil);
    this._frozenUntil.set(frozenUntil && frozenUntil.getTime() > Date.now() ? frozenUntil : null);

    // Si le gel est expiré, dégeler automatiquement
    if (frozenUntil && frozenUntil.getTime() <= Date.now()) {
      await this.unfreezeProfile(expert.id);
    }

    // Vérifier les propositions expirées
    await this.checkExpiredProposals(expert.id);

    // Lancer un check toutes les 30s
    this.stopPeriodicCheck();
    this._checkInterval = setInterval(() => {
      this.zone.run(() => {
        this.checkExpiredProposals(expert.id);
        // Rafraîchir le computed de isFrozen/freezeRemainingMs
        const until = this._frozenUntil();
        if (until && until.getTime() <= Date.now()) {
          this.unfreezeProfile(expert.id);
        }
      });
    }, 30_000);
  }

  stopPeriodicCheck(): void {
    if (this._checkInterval) {
      clearInterval(this._checkInterval);
      this._checkInterval = null;
    }
  }

  // ── Vérifier les propositions expirées ─────────────────────

  /**
   * Cherche les propositions 'pending' dont expiresAt est dépassé,
   * les passe en 'expired' et ajoute un strike.
   */
  async checkExpiredProposals(expertId: string): Promise<void> {
    try {
      const proposalsRef = collection(firebase.firestore, 'proposals');
      const q = query(
        proposalsRef,
        where('expertId', '==', expertId),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      const now = Date.now();

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const expiresAt = this.toDate(data['expiresAt']);

        // Si pas de deadline (ancienne proposition) ou pas encore expirée → skip
        if (!expiresAt || expiresAt.getTime() > now) continue;

        // Marquer comme expirée
        await updateDoc(doc(firebase.firestore, 'proposals', docSnap.id), {
          status: 'expired',
          updatedAt: serverTimestamp()
        });

        // Ajouter un strike
        await this.addStrike(expertId, data['title'] || 'Proposition', docSnap.id);

        // Notifier le recruteur que la proposition a expiré
        if (data['clientId']) {
          const expertUser = this.auth.getCurrentUser()();
          const expertName = expertUser
            ? `${expertUser.firstName} ${expertUser.lastName}`
            : 'L\'expert';
          try {
            await this.notifService.notifyProposalExpired(
              data['clientId'], expertName, data['title'] || 'Proposition', docSnap.id
            );
          } catch (e) { console.warn('Notif expired failed:', e); }
        }
      }
    } catch (e) {
      console.error('Erreur check expired proposals:', e);
    }
  }

  // ── Système de strikes ─────────────────────────────────────

  /**
   * Ajoute un strike à l'expert. Si 3 strikes → gel du profil pendant 7 jours.
   */
  private async addStrike(expertId: string, proposalTitle: string, proposalId: string): Promise<void> {
    try {
      const userRef = doc(firebase.firestore, 'users', expertId);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return;

      const data = snap.data();
      const currentStrikes = (data['freezeStrikes'] || 0) + 1;
      const updateData: Record<string, any> = {
        freezeStrikes: currentStrikes,
        lastStrikeAt:  serverTimestamp(),
        updatedAt:     serverTimestamp()
      };

      this.zone.run(() => this._freezeStrikes.set(currentStrikes));

      // Notification strike
      await this.notifService.notifyProposalExpiredExpert(
        expertId, proposalTitle, currentStrikes, proposalId
      );

      // 3 strikes → GEL
      if (currentStrikes >= MAX_STRIKES) {
        const frozenUntil = new Date(Date.now() + FREEZE_DURATION_MS);
        updateData['frozenUntil'] = frozenUntil;
        updateData['isPublic']    = false;
        updateData['isAvailable'] = false;
        // Reset des strikes après le gel
        updateData['freezeStrikes'] = 0;

        this.zone.run(() => {
          this._frozenUntil.set(frozenUntil);
          this._freezeStrikes.set(0);
        });

        // Notification de gel
        await this.notifService.notifyProfileFrozen(expertId, frozenUntil);
      }

      await updateDoc(userRef, updateData);
    } catch (e) {
      console.error('Erreur addStrike:', e);
    }
  }

  // ── Dégeler le profil ──────────────────────────────────────

  private async unfreezeProfile(expertId: string): Promise<void> {
    try {
      await updateDoc(doc(firebase.firestore, 'users', expertId), {
        frozenUntil:    null,
        freezeStrikes:  0,
        updatedAt:      serverTimestamp()
      });
      this.zone.run(() => {
        this._frozenUntil.set(null);
        this._freezeStrikes.set(0);
      });
    } catch (e) {
      console.error('Erreur unfreeze:', e);
    }
  }

  // ── Calculer le temps restant pour répondre à une proposition

  /**
   * Retourne le nombre de millisecondes restantes avant expiration.
   * 0 = expiré.
   */
  getTimeRemainingMs(proposal: Proposal): number {
    const expiresAt = this.toDate(proposal.expiresAt);
    if (!expiresAt) {
      // Fallback : createdAt + 1h
      const created = this.toDate(proposal.createdAt);
      if (!created) return 0;
      return Math.max(0, created.getTime() + RESPONSE_DEADLINE_MS - Date.now());
    }
    return Math.max(0, expiresAt.getTime() - Date.now());
  }

  /**
   * Formate un temps restant en "XXm XXs" ou "Expiré"
   */
  formatCountdown(ms: number): string {
    if (ms <= 0) return 'Expiré';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min >= 60) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return `${h}h ${m.toString().padStart(2, '0')}m`;
    }
    return `${min}m ${sec.toString().padStart(2, '0')}s`;
  }

  /**
   * Retourne le pourcentage de temps écoulé (0→100)
   */
  getProgressPercent(proposal: Proposal): number {
    const expiresAt = this.toDate(proposal.expiresAt);
    const createdAt = this.toDate(proposal.createdAt);
    if (!createdAt) return 100;
    const deadline = expiresAt ? expiresAt.getTime() : createdAt.getTime() + RESPONSE_DEADLINE_MS;
    const total = deadline - createdAt.getTime();
    const elapsed = Date.now() - createdAt.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  // ── Helpers ────────────────────────────────────────────────

  private toDate(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    if (v instanceof Timestamp) return v.toDate();
    if (typeof v === 'object' && 'seconds' in v) return new Date(v.seconds * 1000);
    return null;
  }
}
