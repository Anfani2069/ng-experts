import { Injectable, inject, signal } from '@angular/core';
import { collection, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
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
        where('role', '==', 'expert')
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
   * Ajoute une proposition de mission pour un expert
   */
  async addProposal(proposal: Omit<import('@core/models/user.model').Proposal, 'id'>): Promise<void> {
    try {
      this.isLoading.set(true);
      const proposalsRef = collection(firebase.firestore, 'proposals');
      await import('firebase/firestore').then(firestore =>
        firestore.addDoc(proposalsRef, proposal)
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la proposition:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Récupère les propositions reçues pour un expert donné
   */
  async getProposalsForExpert(expertId: string): Promise<import('@core/models/user.model').Proposal[]> {
    try {
      this.isLoading.set(true);
      const proposalsRef = collection(firebase.firestore, 'proposals');
      const q = query(proposalsRef, where('expertId', '==', expertId));

      const querySnapshot = await getDocs(q);
      const proposals: import('@core/models/user.model').Proposal[] = [];

      querySnapshot.forEach((doc) => {
        proposals.push({
          id: doc.id,
          ...doc.data()
        } as import('@core/models/user.model').Proposal);
      });

      // Trier par date décroissante (plus récent en premier)
      return proposals.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des propositions:', error);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Récupère une proposition par son ID
   */
  async getProposalById(proposalId: string): Promise<import('@core/models/user.model').Proposal | null> {
    try {
      this.isLoading.set(true);
      const proposalRef = doc(firebase.firestore, 'proposals', proposalId);
      const proposalSnap = await getDoc(proposalRef);

      if (proposalSnap.exists()) {
        return {
          id: proposalSnap.id,
          ...proposalSnap.data()
        } as import('@core/models/user.model').Proposal;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la proposition:', error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Met à jour le statut d'une proposition (acceptée/refusée)
   */
  async updateProposalStatus(
    proposalId: string,
    status: 'accepted' | 'rejected'
  ): Promise<void> {
    try {
      this.isLoading.set(true);
      const proposalRef = doc(firebase.firestore, 'proposals', proposalId);

      await updateDoc(proposalRef, {
        status,
        updatedAt: new Date()
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
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
        reviewsCount: 12,
        recommendationsCount: 5,
        responseRate: 98,
        responseTime: '2h',
        languages: ['Français', 'Anglais'],
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
        reviewsCount: 8,
        recommendationsCount: 3,
        responseRate: 100,
        responseTime: '1h',
        languages: ['Français', 'Anglais', 'Espagnol'],
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
        reviewsCount: 15,
        recommendationsCount: 2,
        responseRate: 85,
        responseTime: '6h',
        languages: ['Français'],
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
