import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firebase } from '@core/config/firebase.config';
import { Auth } from '@core/services/auth.service';
import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

interface TestResult {
  service: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

@Component({
  selector: 'app-firebase-test',
  templateUrl: './firebase-test.component.html',
  styleUrl: './firebase-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class FirebaseTest {
  private auth = inject(Auth);

  protected readonly isRunning = signal(false);
  protected readonly results = signal<TestResult[]>([]);
  
  /**
   * Lancer tous les tests Firebase
   */
  async runAllTests(): Promise<void> {
    this.isRunning.set(true);
    this.results.set([]);
    
    const tests = [
      { name: 'Firebase App', test: this.testFirebaseApp.bind(this) },
      { name: 'Firebase Auth', test: this.testFirebaseAuth.bind(this) },
      { name: 'Firestore Database', test: this.testFirestore.bind(this) },
      { name: 'Analytics', test: this.testAnalytics.bind(this) }
    ];

    for (const { name, test } of tests) {
      await this.runSingleTest(name, test);
      // Petite pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.isRunning.set(false);
  }

  /**
   * Exécuter un test individuel
   */
  private async runSingleTest(serviceName: string, testFn: () => Promise<TestResult>): Promise<void> {
    this.updateTestResult(serviceName, 'pending', 'Test en cours...');
    
    try {
      const result = await testFn();
      this.updateTestResult(serviceName, result.status, result.message, result.details);
    } catch (error: any) {
      this.updateTestResult(serviceName, 'error', 'Erreur inattendue', error.message);
    }
  }

  /**
   * Mettre à jour le résultat d'un test
   */
  private updateTestResult(service: string, status: TestResult['status'], message: string, details?: string): void {
    this.results.update(results => {
      const existingIndex = results.findIndex(r => r.service === service);
      const newResult: TestResult = { service, status, message, details };
      
      if (existingIndex >= 0) {
        results[existingIndex] = newResult;
      } else {
        results.push(newResult);
      }
      
      return [...results];
    });
  }

  /**
   * Test 1: Vérifier l'initialisation Firebase App
   */
  private async testFirebaseApp(): Promise<TestResult> {
    try {
      const app = firebase.getApp();
      const config = app.options;
      
      if (config.projectId === 'ng-experts') {
        return {
          service: 'Firebase App',
          status: 'success',
          message: 'Application Firebase initialisée avec succès',
          details: `Project ID: ${config.projectId}`
        };
      } else {
        return {
          service: 'Firebase App',
          status: 'error',
          message: 'Configuration incorrecte',
          details: `Project ID attendu: ng-experts, reçu: ${config.projectId}`
        };
      }
    } catch (error: any) {
      return {
        service: 'Firebase App',
        status: 'error',
        message: 'Erreur d\'initialisation Firebase',
        details: error.message
      };
    }
  }

  /**
   * Test 2: Vérifier Firebase Auth
   */
  private async testFirebaseAuth(): Promise<TestResult> {
    try {
      const auth = firebase.auth;
      
      if (auth) {
        return {
          service: 'Firebase Auth',
          status: 'success',
          message: 'Service d\'authentification opérationnel',
          details: `Auth Domain: ${auth.app.options.authDomain}`
        };
      } else {
        return {
          service: 'Firebase Auth',
          status: 'error',
          message: 'Service d\'authentification non initialisé'
        };
      }
    } catch (error: any) {
      return {
        service: 'Firebase Auth',
        status: 'error',
        message: 'Erreur du service Auth',
        details: error.message
      };
    }
  }

  /**
   * Test 3: Vérifier Firestore Database
   */
  private async testFirestore(): Promise<TestResult> {
    try {
      const firestore = firebase.firestore;
      const testDocId = 'test-connection-' + Date.now();
      const testData = {
        message: 'Test de connexion Firestore',
        timestamp: new Date(),
        testId: testDocId
      };

      // Créer un document de test
      const docRef = doc(firestore, 'test-collection', testDocId);
      await setDoc(docRef, testData);

      // Lire le document
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Nettoyer le document de test
        await deleteDoc(docRef);
        
        return {
          service: 'Firestore Database',
          status: 'success',
          message: 'Base de données opérationnelle (lecture/écriture)',
          details: `Document créé et lu avec succès: ${data['message']}`
        };
      } else {
        return {
          service: 'Firestore Database',
          status: 'error',
          message: 'Impossible de lire le document créé'
        };
      }
    } catch (error: any) {
      return {
        service: 'Firestore Database',
        status: 'error',
        message: 'Erreur de connexion Firestore',
        details: error.message
      };
    }
  }

  /**
   * Test 4: Vérifier Analytics
   */
  private async testAnalytics(): Promise<TestResult> {
    try {
      const analytics = firebase.analytics;
      
      if (analytics) {
        return {
          service: 'Analytics',
          status: 'success',
          message: 'Service Analytics initialisé',
          details: 'Analytics prêt pour le tracking d\'événements'
        };
      } else {
        return {
          service: 'Analytics',
          status: 'error',
          message: 'Analytics non disponible (environnement côté serveur ?)'
        };
      }
    } catch (error: any) {
      return {
        service: 'Analytics',
        status: 'error',
        message: 'Erreur Analytics',
        details: error.message
      };
    }
  }

  /**
   * Effacer tous les résultats
   */
  clearResults(): void {
    this.results.set([]);
  }

  /**
   * Obtenir le nombre de tests réussis
   */
  getSuccessCount(): number {
    return this.results().filter(r => r.status === 'success').length;
  }

  /**
   * Obtenir le nombre total de tests
   */
  getTotalTests(): number {
    return this.results().length;
  }
}
