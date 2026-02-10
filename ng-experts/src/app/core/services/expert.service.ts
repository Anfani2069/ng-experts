import { Injectable, inject, signal } from '@angular/core';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Expert } from '@core/models/user.model';
import { firebase } from '@core/config/firebase.config';

@Injectable({
  providedIn: 'root'
})
export class ExpertService {
  private experts = signal<Expert[]>([]);
  private isLoading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Signal pour obtenir tous les experts
  public readonly expertsData = this.experts.asReadonly();
  public readonly loading = this.isLoading.asReadonly();
  public readonly errorMessage = this.error.asReadonly();

  /**
   * Récupère un expert par son ID depuis Firestore
   */
  async getExpertById(expertId: string): Promise<Expert | null> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Référence du document expert dans Firestore
      const expertRef = doc(firebase.firestore, 'users', expertId);
      const expertSnap = await getDoc(expertRef);

      if (expertSnap.exists()) {
        const expertData = expertSnap.data();
        
        // Vérifier que c'est bien un expert
        if (expertData['role'] === 'expert') {
          return {
            id: expertSnap.id,
            ...expertData
          } as Expert;
        }
      }

      return null;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'expert:', error);
      this.error.set('Impossible de charger les données de l\'expert');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Récupère tous les experts vérifiés depuis Firestore
   */
  async getAllExperts(): Promise<Expert[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Query pour récupérer tous les utilisateurs avec le rôle 'expert' et vérifiés
      const expertsRef = collection(firebase.firestore, 'users');
      const expertsQuery = query(
        expertsRef, 
        where('role', '==', 'expert'),
        where('verificationStatus', '==', 'verified')
      );

      const querySnapshot = await getDocs(expertsQuery);
      const expertsList: Expert[] = [];

      querySnapshot.forEach((doc) => {
        expertsList.push({
          id: doc.id,
          ...doc.data()
        } as Expert);
      });

      this.experts.set(expertsList);
      return expertsList;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des experts:', error);
      this.error.set('Impossible de charger la liste des experts');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Récupère les experts disponibles pour une mission
   */
  async getAvailableExperts(): Promise<Expert[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const expertsRef = collection(firebase.firestore, 'users');
      const expertsQuery = query(
        expertsRef,
        where('role', '==', 'expert'),
        where('verificationStatus', '==', 'verified'),
        where('isAvailable', '==', true)
      );

      const querySnapshot = await getDocs(expertsQuery);
      const availableExperts: Expert[] = [];

      querySnapshot.forEach((doc) => {
        availableExperts.push({
          id: doc.id,
          ...doc.data()
        } as Expert);
      });

      return availableExperts;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des experts disponibles:', error);
      this.error.set('Impossible de charger les experts disponibles');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Données mockées pour les tests (fallback en cas d'erreur Firebase)
   */
  getMockExpertById(expertId: string): Partial<Expert> | null {
    const mockExperts: { [key: string]: Partial<Expert> } = {
      '1': {
        id: '1',
        firstName: 'Jean-Pierre',
        lastName: 'Dubois',
        email: 'jp.dubois@example.com',
        phone: '+33 6 12 34 56 78',
        company: 'TechCorp Solutions',
        location: 'Paris',
        city: 'Paris',
        bio: "Expert Angular senior avec 8 ans d'expérience en développement d'applications web complexes. Spécialisé dans l'architecture micro-frontend et l'optimisation des performances.",
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        verificationStatus: 'verified',
        isAvailable: true,
        projectsCompleted: 47,
        rating: 4.9,
        skills: [
          {
            id: '1',
            name: 'Angular',
            level: 'expert',
            category: 'frontend',
            yearsOfExperience: 8,
          },
          {
            id: '2',
            name: 'TypeScript',
            level: 'expert',
            category: 'frontend',
            yearsOfExperience: 7,
          },
          {
            id: '3',
            name: 'RxJS',
            level: 'advanced',
            category: 'frontend',
            yearsOfExperience: 5,
          },
        ],
        certifications: [
          {
            id: '1',
            name: 'Angular Certified Developer',
            issuer: 'Google',
            dateObtained: new Date('2023-06-15'),
          },
        ],
        experience: [
          {
            id: '1',
            title: 'Senior Frontend Architect',
            company: 'TechCorp Solutions',
            location: 'Paris, France',
            startDate: new Date('2021-01-15'),
            endDate: undefined,
            isCurrent: true,
            description: 'Lead du développement frontend pour une plateforme SaaS utilisée par plus de 100k utilisateurs.',
            technologies: ['Angular', 'TypeScript', 'NgRx', 'Module Federation'],
          },
        ],
        availability: {
          types: ['freelance', 'consulting'],
          startDate: '2024-03-01',
          dailyRate: '650€',
          workPreference: 'hybrid',
          missionDuration: '3-6 mois',
        },
      },
      '2': {
        id: '2',
        firstName: 'Sophie',
        lastName: 'Martin',
        email: 'sophie.martin@example.com',
        phone: '+33 6 98 76 54 32',
        company: 'Digital Innovation',
        location: 'Lyon',
        city: 'Lyon',
        bio: "Développeuse Angular fullstack avec une expertise en architecture moderne et performance.",
        avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
        verificationStatus: 'verified',
        isAvailable: true,
        projectsCompleted: 32,
        rating: 4.8,
        skills: [
          {
            id: '1',
            name: 'Angular',
            level: 'expert',
            category: 'frontend',
            yearsOfExperience: 6,
          },
          {
            id: '2',
            name: 'Node.js',
            level: 'advanced',
            category: 'backend',
            yearsOfExperience: 5,
          },
        ],
        certifications: [
          {
            id: '1',
            name: 'MongoDB Developer',
            issuer: 'MongoDB University',
            dateObtained: new Date('2023-09-10'),
          },
        ],
        experience: [
          {
            id: '1',
            title: 'Lead Developer Angular',
            company: 'Digital Innovation',
            location: 'Lyon, France',
            startDate: new Date('2022-03-01'),
            endDate: undefined,
            isCurrent: true,
            description: 'Développement d\'applications Angular complexes.',
            technologies: ['Angular', 'TypeScript', 'Node.js'],
          },
        ],
        availability: {
          types: ['consulting', 'freelance'],
          startDate: '2024-03-01',
          dailyRate: '650€',
          workPreference: 'hybrid',
          missionDuration: '3-6 mois',
        },
      },
      '3': {
        id: '3',
        firstName: 'Thomas',
        lastName: 'Leroux',
        email: 'thomas.leroux@example.com',
        company: 'StartupTech',
        location: 'Toulouse',
        city: 'Toulouse',
        bio: "Expert Angular avec spécialisation en applications mobiles et PWA.",
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
        verificationStatus: 'verified',
        isAvailable: false,
        projectsCompleted: 28,
        rating: 4.7,
        availability: {
          types: ['mentoring', 'consulting'],
          startDate: '2024-06-01',
          dailyRate: '750€',
          workPreference: 'remote',
          missionDuration: '1-2 semaines',
        },
      },
    };

    return mockExperts[expertId] || null;
  }
}
