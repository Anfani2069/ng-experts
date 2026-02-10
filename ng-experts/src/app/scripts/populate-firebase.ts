import { collection, doc, setDoc } from 'firebase/firestore';
import { firebase } from '@core/config/firebase.config';
import { Expert } from '@core/models/user.model';

/**
 * Script pour alimenter Firebase avec des données d'experts pour les tests
 * À exécuter une fois pour créer les données de base
 */

const expertsData: Omit<Expert, 'id'>[] = [
  {
    email: 'jp.dubois@example.com',
    role: 'expert',
    firstName: 'Jean-Pierre',
    lastName: 'Dubois',
    company: 'TechCorp Solutions',
    location: 'Paris',
    city: 'Paris',
    bio: "Expert Angular senior avec 8 ans d'expérience en développement d'applications web complexes. Spécialisé dans l'architecture micro-frontend et l'optimisation des performances.",
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    verificationStatus: 'verified',
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
      {
        id: '4',
        name: 'NgRx',
        level: 'expert',
        category: 'frontend',
        yearsOfExperience: 6,
      },
      {
        id: '5',
        name: 'Jest',
        level: 'advanced',
        category: 'testing',
        yearsOfExperience: 4,
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
        description: 'Lead du développement frontend pour une plateforme SaaS utilisée par plus de 100k utilisateurs. Architecture micro-frontend avec Angular et Module Federation.',
        technologies: ['Angular', 'TypeScript', 'NgRx', 'Module Federation', 'Docker'],
      },
      {
        id: '2',
        title: 'Développeur Angular Senior',
        company: 'Startup Innovante',
        location: 'Paris, France',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2020-12-31'),
        isCurrent: false,
        description: 'Développement d\'applications Angular complexes avec intégration API REST et WebSocket.',
        technologies: ['Angular', 'TypeScript', 'RxJS', 'Material UI'],
      },
    ],
    certifications: [
      {
        id: '1',
        name: 'Angular Certified Developer',
        issuer: 'Google',
        dateObtained: new Date('2023-06-15'),
      },
      {
        id: '2',
        name: 'AWS Solutions Architect',
        issuer: 'Amazon Web Services',
        dateObtained: new Date('2023-03-20'),
      },
    ],
    availability: {
      types: ['freelance', 'consulting'],
      startDate: '2024-03-01',
      dailyRate: '650€',
      workPreference: 'hybrid',
      missionDuration: '3-6 mois',
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 47,
    reviewsCount: 23,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    email: 'sophie.martin@example.com',
    role: 'expert',
    firstName: 'Sophie',
    lastName: 'Martin',
    company: 'Digital Innovation',
    location: 'Lyon',
    city: 'Lyon',
    bio: "Développeuse Angular fullstack avec une expertise en architecture moderne et performance. Passionnée par les nouvelles technologies et l'UX.",
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    verificationStatus: 'verified',
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
      {
        id: '3',
        name: 'MongoDB',
        level: 'advanced',
        category: 'backend',
        yearsOfExperience: 4,
      },
      {
        id: '4',
        name: 'Docker',
        level: 'intermediate',
        category: 'devops',
        yearsOfExperience: 3,
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
        description: 'Développement d\'applications Angular complexes avec intégration API REST et gestion d\'état avancée.',
        technologies: ['Angular', 'TypeScript', 'Node.js', 'MongoDB'],
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
    availability: {
      types: ['consulting', 'freelance'],
      startDate: '2024-03-01',
      dailyRate: '650€',
      workPreference: 'hybrid',
      missionDuration: '3-6 mois',
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 32,
    reviewsCount: 18,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    email: 'thomas.leroux@example.com',
    role: 'expert',
    firstName: 'Thomas',
    lastName: 'Leroux',
    company: 'StartupTech',
    location: 'Toulouse',
    city: 'Toulouse',
    bio: "Expert Angular avec spécialisation en applications mobiles et PWA. Formateur et consultant indépendant.",
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    verificationStatus: 'verified',
    skills: [
      {
        id: '1',
        name: 'Angular',
        level: 'expert',
        category: 'frontend',
        yearsOfExperience: 5,
      },
      {
        id: '2',
        name: 'Ionic',
        level: 'expert',
        category: 'mobile',
        yearsOfExperience: 4,
      },
      {
        id: '3',
        name: 'PWA',
        level: 'advanced',
        category: 'frontend',
        yearsOfExperience: 3,
      },
    ],
    experience: [
      {
        id: '1',
        title: 'Consultant Angular',
        company: 'Indépendant',
        location: 'Toulouse, France',
        startDate: new Date('2020-06-01'),
        endDate: undefined,
        isCurrent: true,
        description: 'Conseil et développement d\'applications Angular pour diverses entreprises.',
        technologies: ['Angular', 'Ionic', 'TypeScript', 'Firebase'],
      },
    ],
    certifications: [
      {
        id: '1',
        name: 'Angular Expert Certification',
        issuer: 'Angular Team',
        dateObtained: new Date('2023-01-15'),
      },
    ],
    availability: {
      types: ['mentoring', 'consulting'],
      startDate: '2024-06-01',
      dailyRate: '750€',
      workPreference: 'remote',
      missionDuration: '1-2 semaines',
    },
    isAvailable: false,
    isPublic: true,
    projectsCompleted: 28,
    reviewsCount: 14,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    email: 'marie.durand@example.com',
    role: 'expert',
    firstName: 'Marie',
    lastName: 'Durand',
    company: 'WebAgency Pro',
    location: 'Nantes',
    city: 'Nantes',
    bio: "Experte Angular et UX/UI avec 7 ans d'expérience. Spécialisée dans la création d'interfaces utilisateur modernes et accessibles.",
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    verificationStatus: 'verified',
    skills: [
      {
        id: '1',
        name: 'Angular',
        level: 'expert',
        category: 'frontend',
        yearsOfExperience: 7,
      },
      {
        id: '2',
        name: 'Angular Material',
        level: 'expert',
        category: 'frontend',
        yearsOfExperience: 5,
      },
      {
        id: '3',
        name: 'SCSS',
        level: 'advanced',
        category: 'frontend',
        yearsOfExperience: 6,
      },
      {
        id: '4',
        name: 'Figma',
        level: 'advanced',
        category: 'other',
        yearsOfExperience: 4,
      },
    ],
    experience: [
      {
        id: '1',
        title: 'Senior UX Developer',
        company: 'WebAgency Pro',
        location: 'Nantes, France',
        startDate: new Date('2020-09-01'),
        endDate: undefined,
        isCurrent: true,
        description: 'Développement d\'interfaces Angular avec focus sur l\'expérience utilisateur et l\'accessibilité.',
        technologies: ['Angular', 'Angular Material', 'SCSS', 'Storybook'],
      },
    ],
    certifications: [
      {
        id: '1',
        name: 'UX Design Professional',
        issuer: 'Google UX Design',
        dateObtained: new Date('2022-11-20'),
      },
    ],
    availability: {
      types: ['freelance'],
      startDate: '2024-04-01',
      dailyRate: '600€',
      workPreference: 'hybrid',
      missionDuration: '2-4 mois',
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 35,
    reviewsCount: 21,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  },
  {
    email: 'alex.bernard@example.com',
    role: 'expert',
    firstName: 'Alexandre',
    lastName: 'Bernard',
    company: 'Tech Consulting',
    location: 'Bordeaux',
    city: 'Bordeaux',
    bio: "Développeur Angular passionné par les performances et l'architecture. Expert en tests automatisés et CI/CD.",
    avatar: 'https://randomuser.me/api/portraits/men/89.jpg',
    verificationStatus: 'verified',
    skills: [
      {
        id: '1',
        name: 'Angular',
        level: 'advanced',
        category: 'frontend',
        yearsOfExperience: 4,
      },
      {
        id: '2',
        name: 'Cypress',
        level: 'expert',
        category: 'testing',
        yearsOfExperience: 4,
      },
      {
        id: '3',
        name: 'Jenkins',
        level: 'advanced',
        category: 'devops',
        yearsOfExperience: 3,
      },
      {
        id: '4',
        name: 'Playwright',
        level: 'advanced',
        category: 'testing',
        yearsOfExperience: 2,
      },
    ],
    experience: [
      {
        id: '1',
        title: 'DevOps Angular Developer',
        company: 'Tech Consulting',
        location: 'Bordeaux, France',
        startDate: new Date('2021-11-01'),
        endDate: undefined,
        isCurrent: true,
        description: 'Développement Angular avec focus sur l\'automatisation des tests et le déploiement continu.',
        technologies: ['Angular', 'Cypress', 'Jenkins', 'Docker'],
      },
    ],
    certifications: [
      {
        id: '1',
        name: 'Cypress Testing Certification',
        issuer: 'Cypress.io',
        dateObtained: new Date('2023-04-12'),
      },
    ],
    availability: {
      types: ['consulting'],
      startDate: '2024-05-01',
      dailyRate: '580€',
      workPreference: 'remote',
      missionDuration: '2-3 mois',
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 19,
    reviewsCount: 12,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  }
];

/**
 * Fonction pour alimenter Firebase avec les données d'experts
 */
export async function populateFirebaseWithExperts(): Promise<void> {
  console.log('🚀 Début de l\'alimentation de Firebase avec les données d\'experts...');

  try {
    const usersCollection = collection(firebase.firestore, 'users');

    for (let i = 0; i < expertsData.length; i++) {
      const expert = expertsData[i];
      const expertId = `expert_${i + 1}`;
      
      // Créer le document avec l'ID spécifique
      await setDoc(doc(usersCollection, expertId), expert);
      
      console.log(`✅ Expert ${expert.firstName} ${expert.lastName} ajouté avec l'ID: ${expertId}`);
    }

    console.log(`🎉 ${expertsData.length} experts ont été ajoutés avec succès à Firebase !`);
    
    // Afficher les IDs créés
    console.log('\n📋 IDs des experts créés:');
    for (let i = 0; i < expertsData.length; i++) {
      const expert = expertsData[i];
      console.log(`- expert_${i + 1}: ${expert.firstName} ${expert.lastName}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'alimentation de Firebase:', error);
    throw error;
  }
}

/**
 * Fonction utilitaire pour vérifier les données créées
 */
export async function verifyExpertsInFirebase(): Promise<void> {
  console.log('🔍 Vérification des experts dans Firebase...');
  
  try {
    // Cette fonction sera implémentée plus tard pour vérifier les données
    console.log('✅ Vérification terminée');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}
