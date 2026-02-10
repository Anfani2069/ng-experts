import { Injectable, inject, signal } from '@angular/core';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { firebase } from '@core/config/firebase.config';
import { BaseUser, UserRole, Expert, Recruiter } from '@core/models/user.model';
import { Router } from '@angular/router';

/**
 * Service d'authentification pour Ng-Expert
 * Gère l'inscription, connexion et profils utilisateurs (experts/recruteurs)
 */
@Injectable({
  providedIn: 'root'
})
export class Auth {
  private router = inject(Router);
  
  // État de l'authentification
  protected readonly currentUser = signal<BaseUser | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  
  constructor() {
    this.initAuthStateListener();
  }

  /**
   * Écouter les changements d'état d'authentification
   */
  private initAuthStateListener(): void {
    onAuthStateChanged(firebase.auth, async (firebaseUser) => {
      if (firebaseUser) {
        await this.loadUserProfile(firebaseUser);
      } else {
        this.currentUser.set(null);
      }
      this.isLoading.set(false);
    });
  }

  /**
   * Charger le profil utilisateur depuis Firestore
   */
  private async loadUserProfile(firebaseUser: FirebaseUser): Promise<void> {
    try {
      const userDoc = await getDoc(doc(firebase.firestore, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.currentUser.set({
          ...userData,
          id: firebaseUser.uid,
          createdAt: (userData['createdAt'] as Timestamp)?.toDate() || new Date(),
          updatedAt: (userData['updatedAt'] as Timestamp)?.toDate() || new Date()
        } as BaseUser);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      this.error.set('Erreur lors du chargement du profil');
    }
  }

  /**
   * Inscription Expert
   */
  async registerExpert(expertData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    location: string;
    city: string;
    bio: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        firebase.auth, 
        expertData.email, 
        expertData.password
      );

      // Mettre à jour le profil Firebase
      await updateProfile(userCredential.user, {
        displayName: `${expertData.firstName} ${expertData.lastName}`
      });

      // Envoyer email de vérification
      await sendEmailVerification(userCredential.user);

      // Créer le profil expert dans Firestore
      const expert: Omit<Expert, 'id'> = {
        email: expertData.email,
        role: 'expert',
        firstName: expertData.firstName,
        lastName: expertData.lastName,
        company: expertData.company,
        location: expertData.location,
        city: expertData.city,
        bio: expertData.bio,
        verificationStatus: 'pending',
        skills: [],
        experience: [],
        certifications: [],
        availability: {
          types: [],
          startDate: '',
          dailyRate: '',
          workPreference: 'remote',
          missionDuration: ''
        },
        isAvailable: false,
        isPublic: false,
        projectsCompleted: 0,
        reviewsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      await setDoc(doc(firebase.firestore, 'users', userCredential.user.uid), expert);

      return {
        success: true,
        message: 'Compte expert créé avec succès. Vérifiez votre email pour activer votre compte.'
      };

    } catch (error: any) {
      const errorMessage = this.getAuthErrorMessage(error.code);
      this.error.set(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Inscription Recruteur
   */
  async registerRecruiter(recruiterData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company: string;
    companySize?: string;
    industry?: string;
    location: string;
    website?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        firebase.auth, 
        recruiterData.email, 
        recruiterData.password
      );

      // Mettre à jour le profil Firebase
      await updateProfile(userCredential.user, {
        displayName: `${recruiterData.firstName} ${recruiterData.lastName}`
      });

      // Envoyer email de vérification
      await sendEmailVerification(userCredential.user);

      // Créer le profil recruteur dans Firestore
      const recruiter: Omit<Recruiter, 'id'> = {
        email: recruiterData.email,
        role: 'recruiter',
        firstName: recruiterData.firstName,
        lastName: recruiterData.lastName,
        company: recruiterData.company,
        companySize: recruiterData.companySize,
        industry: recruiterData.industry,
        location: recruiterData.location,
        website: recruiterData.website,
        subscription: {
          type: 'monthly',
          status: 'expired', // Nécessite activation d'abonnement
          startDate: new Date(),
          endDate: new Date(),
          contactsRemaining: 0,
          maxContacts: 0,
          autoRenew: false
        },
        contactedExperts: [],
        savedExperts: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      await setDoc(doc(firebase.firestore, 'users', userCredential.user.uid), recruiter);

      return {
        success: true,
        message: 'Compte recruteur créé avec succès. Vérifiez votre email et activez votre abonnement.'
      };

    } catch (error: any) {
      const errorMessage = this.getAuthErrorMessage(error.code);
      this.error.set(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Connexion
   */
  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      await signInWithEmailAndPassword(firebase.auth, email, password);
      
      // Rediriger selon le rôle
      const user = this.currentUser();
      if (user?.role === 'expert') {
        this.router.navigate(['/dashboard']);
      } else if (user?.role === 'recruiter') {
        this.router.navigate(['/recruiter/dashboard']);
      }

      return { success: true, message: 'Connexion réussie' };

    } catch (error: any) {
      const errorMessage = this.getAuthErrorMessage(error.code);
      this.error.set(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await signOut(firebase.auth);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  /**
   * Inscription/Connexion avec Google
   */
  async signInWithGoogle(accountType: 'expert' | 'recruiter'): Promise<{ success: boolean; message: string; isNewUser?: boolean }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(firebase.auth, provider);
      const user = result.user;

      if (!user || !user.email) {
        return { success: false, message: 'Impossible de récupérer les informations Google' };
      }

      // Vérifier si l'utilisateur existe déjà
      const userDoc = await getDoc(doc(firebase.firestore, 'users', user.uid));
      
      if (userDoc.exists()) {
        // Utilisateur existant - connexion
        await this.loadUserProfile(user);
        
        const userData = this.currentUser();
        if (userData?.role === 'expert') {
          this.router.navigate(['/dashboard']);
        } else if (userData?.role === 'recruiter') {
          this.router.navigate(['/recruiter/dashboard']);
        }

        return { 
          success: true, 
          message: 'Connexion Google réussie',
          isNewUser: false 
        };
      } else {
        // Nouvel utilisateur - créer le profil
        const [firstName, ...lastNameParts] = (user.displayName || 'Utilisateur Google').split(' ');
        const lastName = lastNameParts.join(' ') || 'Google';

        if (accountType === 'expert') {
          const expert: Omit<Expert, 'id'> = {
            email: user.email,
            role: 'expert',
            firstName,
            lastName,
            avatar: user.photoURL || undefined,
            location: 'France',
            city: 'Paris',
            bio: 'Expert Angular connecté via Google',
            verificationStatus: 'pending',
            skills: [],
            experience: [],
            certifications: [],
            availability: {
              types: [],
              startDate: '',
              dailyRate: '',
              workPreference: 'remote',
              missionDuration: ''
            },
            isAvailable: false,
            isPublic: false,
            projectsCompleted: 0,
            reviewsCount: 0,
            createdAt: serverTimestamp() as any,
            updatedAt: serverTimestamp() as any,
            isActive: true
          };

          await setDoc(doc(firebase.firestore, 'users', user.uid), expert);
        } else {
          const recruiter: Omit<Recruiter, 'id'> = {
            email: user.email,
            role: 'recruiter',
            firstName,
            lastName,
            avatar: user.photoURL || undefined,
            company: 'Mon Entreprise',
            location: 'France',
            subscription: {
              type: 'monthly',
              status: 'expired',
              startDate: new Date(),
              endDate: new Date(),
              contactsRemaining: 0,
              maxContacts: 0,
              autoRenew: false
            },
            contactedExperts: [],
            savedExperts: [],
            createdAt: serverTimestamp() as any,
            updatedAt: serverTimestamp() as any,
            isActive: true
          };

          await setDoc(doc(firebase.firestore, 'users', user.uid), recruiter);
        }

        // Charger le nouveau profil
        await this.loadUserProfile(user);
        
        if (accountType === 'expert') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/recruiter/dashboard']);
        }

        return { 
          success: true, 
          message: `Compte ${accountType === 'expert' ? 'expert' : 'recruteur'} créé avec succès via Google`,
          isNewUser: true 
        };
      }

    } catch (error: any) {
      console.error('Erreur Google Auth:', error);
      
      let errorMessage = 'Erreur lors de la connexion Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Connexion Google annulée';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloquée par le navigateur. Veuillez autoriser les popups.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
      }

      this.error.set(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Mettre à jour le profil expert dans Firestore
   */
  async updateExpertProfile(expertData: Partial<Expert>): Promise<{ success: boolean; message: string }> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const user = firebase.auth.currentUser;
      if (!user) {
        return { success: false, message: 'Utilisateur non connecté' };
      }

      // Ajouter la date de mise à jour
      const updateData = {
        ...expertData,
        updatedAt: serverTimestamp()
      };

      // Mettre à jour dans Firestore
      await updateDoc(doc(firebase.firestore, 'users', user.uid), updateData);

      // Recharger le profil utilisateur
      await this.loadUserProfile(user);

      return { success: true, message: 'Profil mis à jour avec succès' };

    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error);
      this.error.set('Erreur lors de la mise à jour du profil');
      return { success: false, message: 'Erreur lors de la mise à jour du profil' };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Messages d'erreur Firebase Auth
   */
  private getAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
      'auth/invalid-email': 'Adresse email invalide',
      'auth/user-not-found': 'Aucun utilisateur trouvé avec cette adresse email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
      'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre internet'
    };

    return errorMessages[errorCode] || 'Une erreur inattendue s\'est produite';
  }

  // Getters pour les composants
  getCurrentUser() { return this.currentUser.asReadonly(); }
  getIsLoading() { return this.isLoading.asReadonly(); }
  getError() { return this.error.asReadonly(); }
  isAuthenticated() { return this.currentUser() !== null; }
  isExpert() { return this.currentUser()?.role === 'expert'; }
  isRecruiter() { return this.currentUser()?.role === 'recruiter'; }
}
