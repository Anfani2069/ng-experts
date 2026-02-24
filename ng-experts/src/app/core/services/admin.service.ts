import { Injectable, signal } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { firebase } from '@core/config/firebase.config';
import { BaseUser, Expert, Recruiter, Proposal, VerificationStatus } from '@core/models/user.model';

export interface AdminStats {
  totalUsers: number;
  totalExperts: number;
  totalRecruiters: number;
  totalAdmins: number;
  verifiedExperts: number;
  pendingExperts: number;
  rejectedExperts: number;
  activeUsers: number;
  inactiveUsers: number;
  totalProposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  completedProposals: number;
  rejectedProposals: number;
  recentSignups: { month: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly _users = signal<BaseUser[]>([]);
  private readonly _experts = signal<Expert[]>([]);
  private readonly _recruiters = signal<Recruiter[]>([]);
  private readonly _proposals = signal<Proposal[]>([]);
  private readonly _stats = signal<AdminStats | null>(null);
  private readonly _isLoading = signal(false);

  readonly users = this._users.asReadonly();
  readonly experts = this._experts.asReadonly();
  readonly recruiters = this._recruiters.asReadonly();
  readonly proposals = this._proposals.asReadonly();
  readonly stats = this._stats.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  /**
   * Charge tous les utilisateurs depuis Firestore
   */
  async loadAllUsers(): Promise<void> {
    this._isLoading.set(true);
    try {
      const usersRef = collection(firebase.firestore, 'users');
      const snapshot = await getDocs(usersRef);

      const allUsers: BaseUser[] = [];
      const experts: Expert[] = [];
      const recruiters: Recruiter[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const user = {
          ...data,
          id: docSnap.id,
          createdAt: data['createdAt'] instanceof Timestamp ? data['createdAt'].toDate() : data['createdAt'],
          updatedAt: data['updatedAt'] instanceof Timestamp ? data['updatedAt'].toDate() : data['updatedAt'],
        } as BaseUser;

        allUsers.push(user);

        if (user.role === 'expert') {
          experts.push(user as Expert);
        } else if (user.role === 'recruiter') {
          recruiters.push(user as Recruiter);
        }
      });

      this._users.set(allUsers);
      this._experts.set(experts);
      this._recruiters.set(recruiters);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Charge toutes les propositions
   */
  async loadAllProposals(): Promise<void> {
    try {
      const proposalsRef = collection(firebase.firestore, 'proposals');
      const snapshot = await getDocs(proposalsRef);
      const proposals: Proposal[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        proposals.push({
          id: docSnap.id,
          ...data,
          createdAt: data['createdAt'] instanceof Timestamp ? data['createdAt'].toDate() : data['createdAt'],
        } as Proposal);
      });
      proposals.sort((a, b) => {
        const da = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const db = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return db - da;
      });
      this._proposals.set(proposals);
    } catch (error) {
      console.error('Erreur chargement propositions:', error);
    }
  }

  /**
   * Calcule les statistiques pour le dashboard admin
   */
  computeStats(): AdminStats {
    const users = this._users();
    const experts = this._experts();
    const proposals = this._proposals();

    // Calcul des inscriptions par mois (6 derniers mois)
    const recentSignups: { month: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      const count = users.filter(u => {
        const created = u.createdAt instanceof Date ? u.createdAt : null;
        if (!created) return false;
        return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
      }).length;
      recentSignups.push({ month: monthLabel, count });
    }

    const stats: AdminStats = {
      totalUsers: users.length,
      totalExperts: experts.length,
      totalRecruiters: users.filter(u => u.role === 'recruiter').length,
      totalAdmins: users.filter(u => u.role === 'admin').length,
      verifiedExperts: experts.filter(e => e.verificationStatus === 'verified').length,
      pendingExperts: experts.filter(e => e.verificationStatus === 'pending').length,
      rejectedExperts: experts.filter(e => e.verificationStatus === 'rejected').length,
      activeUsers: users.filter(u => u.isActive).length,
      inactiveUsers: users.filter(u => !u.isActive).length,
      totalProposals: proposals.length,
      pendingProposals: proposals.filter(p => p.status === 'pending').length,
      acceptedProposals: proposals.filter(p => p.status === 'accepted').length,
      completedProposals: proposals.filter(p => p.status === 'completed').length,
      rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
      recentSignups,
    };

    this._stats.set(stats);
    return stats;
  }

  /**
   * Modifier le statut de vérification d'un expert
   */
  async setVerificationStatus(userId: string, status: VerificationStatus): Promise<void> {
    try {
      const userRef = doc(firebase.firestore, 'users', userId);
      const updateData: any = {
        verificationStatus: status,
        updatedAt: serverTimestamp(),
      };
      if (status === 'verified') {
        updateData.verifiedAt = serverTimestamp();
      }
      await updateDoc(userRef, updateData);

      // Mettre à jour le state local
      this._experts.update(experts =>
        experts.map(e => e.id === userId ? { ...e, verificationStatus: status } : e)
      );
      this._users.update(users =>
        users.map(u => u.id === userId ? { ...u, verificationStatus: status } as any : u)
      );
    } catch (error) {
      console.error('Erreur mise à jour vérification:', error);
      throw error;
    }
  }

  /**
   * Activer/Désactiver un utilisateur
   */
  async toggleUserActive(userId: string, isActive: boolean): Promise<void> {
    try {
      const userRef = doc(firebase.firestore, 'users', userId);
      await updateDoc(userRef, { isActive, updatedAt: serverTimestamp() });

      this._users.update(users =>
        users.map(u => u.id === userId ? { ...u, isActive } : u)
      );
      this._experts.update(experts =>
        experts.map(e => e.id === userId ? { ...e, isActive } : e)
      );
      this._recruiters.update(recruiters =>
        recruiters.map(r => r.id === userId ? { ...r, isActive } : r)
      );
    } catch (error) {
      console.error('Erreur toggle active:', error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur (document Firestore uniquement)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(firebase.firestore, 'users', userId));
      this._users.update(users => users.filter(u => u.id !== userId));
      this._experts.update(experts => experts.filter(e => e.id !== userId));
      this._recruiters.update(recruiters => recruiters.filter(r => r.id !== userId));
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupère le nom d'un utilisateur par son ID
   */
  getUserNameById(userId: string): string {
    const user = this._users().find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : userId.slice(0, 8) + '...';
  }
}
