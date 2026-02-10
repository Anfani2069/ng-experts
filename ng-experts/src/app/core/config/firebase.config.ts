import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { environment } from '../../../environments/environment';

/**
 * Configuration Firebase pour Ng-Expert
 * Plateforme premium B2B pour connecter recruteurs et experts Angular
 */
export const firebaseConfig = environment.firebase;

/**
 * Initialisation des services Firebase
 */
class FirebaseService {
  private app: FirebaseApp;
  public auth: Auth;
  public firestore: Firestore;
  public analytics: Analytics | null = null;

  constructor() {
    // Initialiser Firebase App
    this.app = initializeApp(firebaseConfig);
    
    // Initialiser les services
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
    
    // Analytics seulement côté client
    if (typeof window !== 'undefined') {
      this.analytics = getAnalytics(this.app);
    }
  }

  getApp(): FirebaseApp {
    return this.app;
  }
}

// Singleton Firebase
export const firebase = new FirebaseService();
