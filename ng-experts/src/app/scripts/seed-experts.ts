import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';

/**
 * Script pour peupler Firebase avec des données d'experts de test
 * 
 * Exécution :
 * npx ts-node src/app/scripts/seed-experts.ts
 */

// Initialiser Firebase
const app = initializeApp(environment.firebase);
const db = getFirestore(app);

// Données d'experts de test
const expertsData = [
  {
    id: 'expert-001',
    email: 'camille.coutens@example.com',
    role: 'expert',
    firstName: 'Camille',
    lastName: 'Coutens',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Bordeaux, France',
    city: 'Bordeaux',
    phone: '+33 6 12 34 56 78',
    bio: 'Développeuse Vue.js / Nuxt + CTO @augalo @augocel @aucode @auciono. Passionnée par les technologies frontend modernes et l\'architecture d\'applications web.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-01-15'),
    skills: [
      { id: 's1', name: 'Vue.js', category: 'frontend', level: 'expert', yearsOfExperience: 7 },
      { id: 's2', name: 'Nuxt', category: 'frontend', level: 'expert', yearsOfExperience: 5 },
      { id: 's3', name: 'Ionic', category: 'mobile', level: 'advanced', yearsOfExperience: 4 },
      { id: 's4', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 6 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'CTO',
        company: 'Augalo',
        location: 'Bordeaux',
        startDate: new Date('2021-01-01'),
        isCurrent: true,
        description: 'Direction technique et développement frontend',
        technologies: ['Vue.js', 'Nuxt', 'TypeScript']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance', 'consulting'],
      startDate: '2024-03-01',
      dailyRate: '600€',
      workPreference: 'remote',
      missionDuration: '3-6 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 24,
    rating: 5.0,
    reviewsCount: 24,
    recommendationsCount: 3,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-002',
    email: 'dina.rama@example.com',
    role: 'expert',
    firstName: 'Dina',
    lastName: 'Ramarovahoaka',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Bordeaux, France',
    city: 'Bordeaux',
    phone: '+33 6 23 45 67 89',
    bio: 'Bonjour, je m\'appelle Dina, 40 ans, développeuse frontend passionnée ! J\'habite à Bordeaux et je suis spécialisée en Angular avec une expertise en React.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-01-20'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 8 },
      { id: 's2', name: 'React', category: 'frontend', level: 'advanced', yearsOfExperience: 5 },
      { id: 's3', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 7 },
      { id: 's4', name: 'RxJS', category: 'frontend', level: 'advanced', yearsOfExperience: 6 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp',
        location: 'Bordeaux',
        startDate: new Date('2019-03-01'),
        isCurrent: true,
        description: 'Développement d\'applications Angular et React',
        technologies: ['Angular', 'React', 'TypeScript']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance', 'consulting'],
      startDate: '2024-04-01',
      dailyRate: '650€',
      workPreference: 'hybrid',
      missionDuration: '6-12 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 18,
    rating: 4.9,
    reviewsCount: 18,
    recommendationsCount: 2,
    responseRate: 95,
    responseTime: '2h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-003',
    email: 'natacha.dev@example.com',
    role: 'expert',
    firstName: 'Natacha',
    lastName: 'Dupont',
    avatar: 'https://randomuser.me/api/portraits/women/46.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Lille, France',
    city: 'Lille',
    phone: '+33 6 34 56 78 90',
    bio: 'Hello, Moi c\'est Natacha, je suis développeuse Fullstack sur des stacks JS / TS, principalement Angular et Node.js. Passionnée par l\'architecture backend.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-02-01'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 6 },
      { id: 's2', name: 'Next.js', category: 'frontend', level: 'advanced', yearsOfExperience: 3 },
      { id: 's3', name: 'MongoDB', category: 'backend', level: 'advanced', yearsOfExperience: 5 },
      { id: 's4', name: 'Node.js', category: 'backend', level: 'expert', yearsOfExperience: 7 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Fullstack Developer',
        company: 'Digital Agency',
        location: 'Lille',
        startDate: new Date('2020-06-01'),
        isCurrent: true,
        description: 'Développement fullstack avec Angular et Node.js',
        technologies: ['Angular', 'Node.js', 'MongoDB']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance'],
      startDate: '2024-03-15',
      dailyRate: '580€',
      workPreference: 'remote',
      missionDuration: '3-6 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 31,
    rating: 4.8,
    reviewsCount: 31,
    recommendationsCount: 4,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-004',
    email: 'brenda.meunier@example.com',
    role: 'expert',
    firstName: 'Brenda',
    lastName: 'Meunier',
    avatar: 'https://randomuser.me/api/portraits/women/47.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Mende, France',
    city: 'Mende',
    phone: '+33 6 45 67 89 01',
    bio: 'Développeuse full-stack spécialisée en Angular (v2 -> v20) et Python (Django, FastAPI). J\'interviens sur des projets complexes nécessitant une expertise technique pointue.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-01-10'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 9 },
      { id: 's2', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 8 },
      { id: 's3', name: 'RxJS', category: 'frontend', level: 'expert', yearsOfExperience: 7 },
      { id: 's4', name: 'Python', category: 'backend', level: 'advanced', yearsOfExperience: 6 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Lead Angular Developer',
        company: 'Enterprise Solutions',
        location: 'Remote',
        startDate: new Date('2018-01-01'),
        isCurrent: true,
        description: 'Architecture et développement d\'applications Angular enterprise',
        technologies: ['Angular', 'TypeScript', 'RxJS', 'NgRx']
      }
    ],
    certifications: [
      {
        id: 'c1',
        name: 'Angular Certified Developer',
        issuer: 'Google',
        dateObtained: new Date('2023-06-01'),
        credentialUrl: 'https://example.com/cert'
      }
    ],
    availability: {
      types: ['freelance', 'consulting'],
      startDate: '2024-05-01',
      dailyRate: '700€',
      workPreference: 'remote',
      missionDuration: '6-12 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 42,
    rating: 4.7,
    reviewsCount: 42,
    recommendationsCount: 6,
    responseRate: 98,
    responseTime: '4h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-005',
    email: 'manon.carbonnel@example.com',
    role: 'expert',
    firstName: 'Manon',
    lastName: 'Carbonnel',
    avatar: 'https://randomuser.me/api/portraits/women/48.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Nantes, France',
    city: 'Nantes',
    phone: '+33 6 56 78 90 12',
    bio: 'Développeuse web | Software crafter | Agiliste | Yesss Leader | Fresqueuse | Experte en intégration continue et bonnes pratiques de développement.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-02-10'),
    skills: [
      { id: 's1', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 8 },
      { id: 's2', name: 'CSS', category: 'frontend', level: 'expert', yearsOfExperience: 10 },
      { id: 's3', name: 'PHP', category: 'backend', level: 'advanced', yearsOfExperience: 7 },
      { id: 's4', name: 'Angular', category: 'frontend', level: 'advanced', yearsOfExperience: 5 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Software Crafter',
        company: 'Agile Company',
        location: 'Nantes',
        startDate: new Date('2019-09-01'),
        isCurrent: true,
        description: 'Développement web avec focus sur la qualité et les pratiques agiles',
        technologies: ['TypeScript', 'Angular', 'CSS', 'CI/CD']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance', 'mentoring'],
      startDate: '2024-04-01',
      dailyRate: '620€',
      workPreference: 'hybrid',
      missionDuration: '3-6 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 67,
    rating: 4.9,
    reviewsCount: 67,
    recommendationsCount: 8,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-006',
    email: 'emmanuelle.aboaf@example.com',
    role: 'expert',
    firstName: 'Emmanuelle',
    lastName: 'Aboaf',
    avatar: 'https://randomuser.me/api/portraits/women/49.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Paris, France',
    city: 'Paris',
    phone: '+33 6 67 89 01 23',
    bio: 'Sourde de naissance et bilingue avec deux implants cochléaires, je suis développeuse, coach et conférencière passionnée. J\'œuvre pour l\'accessibilité et l\'inclusion dans la tech.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-01-05'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 7 },
      { id: 's2', name: 'React', category: 'frontend', level: 'expert', yearsOfExperience: 6 },
      { id: 's3', name: 'Vue.js', category: 'frontend', level: 'advanced', yearsOfExperience: 4 },
      { id: 's4', name: 'Accessibility', category: 'frontend', level: 'expert', yearsOfExperience: 8 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Senior Frontend Developer & Speaker',
        company: 'Tech Inclusion',
        location: 'Paris',
        startDate: new Date('2017-03-01'),
        isCurrent: true,
        description: 'Développement frontend et conférences sur l\'accessibilité',
        technologies: ['Angular', 'React', 'Vue.js', 'ARIA']
      }
    ],
    certifications: [],
    availability: {
      types: ['consulting', 'mentoring'],
      startDate: '2024-06-01',
      dailyRate: '750€',
      workPreference: 'hybrid',
      missionDuration: '1-3 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 89,
    rating: 5.0,
    reviewsCount: 89,
    recommendationsCount: 15,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais', 'LSF']
  },
  {
    id: 'expert-007',
    email: 'thomas.leroux@example.com',
    role: 'expert',
    firstName: 'Thomas',
    lastName: 'Leroux',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Lyon, France',
    city: 'Lyon',
    phone: '+33 6 78 90 12 34',
    bio: 'Expert Angular avec spécialisation en applications mobiles et PWA. Passionné par les performances et l\'expérience utilisateur optimale sur tous les devices.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-02-15'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 7 },
      { id: 's2', name: 'Ionic', category: 'mobile', level: 'expert', yearsOfExperience: 6 },
      { id: 's3', name: 'PWA', category: 'frontend', level: 'expert', yearsOfExperience: 5 },
      { id: 's4', name: 'Capacitor', category: 'mobile', level: 'advanced', yearsOfExperience: 4 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Mobile Expert',
        company: 'Mobile First',
        location: 'Lyon',
        startDate: new Date('2019-01-01'),
        isCurrent: true,
        description: 'Développement d\'applications mobiles hybrides',
        technologies: ['Angular', 'Ionic', 'Capacitor']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance', 'consulting'],
      startDate: '2024-03-01',
      dailyRate: '680€',
      workPreference: 'remote',
      missionDuration: '3-6 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 53,
    rating: 4.8,
    reviewsCount: 53,
    recommendationsCount: 3,
    responseRate: 92,
    responseTime: '8h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-008',
    email: 'sophie.martin@example.com',
    role: 'expert',
    firstName: 'Sophie',
    lastName: 'Martin',
    avatar: 'https://randomuser.me/api/portraits/women/50.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Toulouse, France',
    city: 'Toulouse',
    phone: '+33 6 89 01 23 45',
    bio: 'Architecte frontend spécialisée en Angular et state management. J\'aide les équipes à structurer leurs applications pour une scalabilité optimale.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-01-25'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 9 },
      { id: 's2', name: 'NgRx', category: 'frontend', level: 'expert', yearsOfExperience: 6 },
      { id: 's3', name: 'RxJS', category: 'frontend', level: 'expert', yearsOfExperience: 8 },
      { id: 's4', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 9 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Frontend Architect',
        company: 'Enterprise Tech',
        location: 'Toulouse',
        startDate: new Date('2017-06-01'),
        isCurrent: true,
        description: 'Architecture et mentorat sur des projets Angular enterprise',
        technologies: ['Angular', 'NgRx', 'RxJS', 'Micro-frontends']
      }
    ],
    certifications: [
      {
        id: 'c1',
        name: 'NgRx Certified',
        issuer: 'NgRx Team',
        dateObtained: new Date('2023-09-01')
      }
    ],
    availability: {
      types: ['consulting', 'mentoring'],
      startDate: '2024-04-15',
      dailyRate: '800€',
      workPreference: 'remote',
      missionDuration: '1-3 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 76,
    rating: 4.9,
    reviewsCount: 76,
    recommendationsCount: 11,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-009',
    email: 'karim.benali@example.com',
    role: 'expert',
    firstName: 'Karim',
    lastName: 'Benali',
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Paris, France',
    city: 'Paris',
    phone: '+33 6 11 22 33 44',
    bio: 'Développeur Angular senior passionné par les architectures micro-frontend et les performances web. 7 ans d\'expérience sur des projets bancaires et e-commerce.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-03-01'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 7 },
      { id: 's2', name: 'NgRx', category: 'frontend', level: 'expert', yearsOfExperience: 5 },
      { id: 's3', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 7 },
      { id: 's4', name: 'Module Federation', category: 'frontend', level: 'advanced', yearsOfExperience: 3 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Senior Angular Developer',
        company: 'BNP Paribas',
        location: 'Paris',
        startDate: new Date('2020-01-01'),
        isCurrent: true,
        description: 'Développement et architecture de portails bancaires Angular',
        technologies: ['Angular', 'NgRx', 'Module Federation']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance'],
      startDate: '2024-04-01',
      dailyRate: '720€',
      workPreference: 'hybrid',
      missionDuration: '6-12 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 38,
    rating: 4.9,
    reviewsCount: 38,
    recommendationsCount: 7,
    responseRate: 98,
    responseTime: '2h',
    languages: ['Français', 'Anglais', 'Arabe']
  },
  {
    id: 'expert-010',
    email: 'lea.moreau@example.com',
    role: 'expert',
    firstName: 'Léa',
    lastName: 'Moreau',
    avatar: 'https://randomuser.me/api/portraits/women/51.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Strasbourg, France',
    city: 'Strasbourg',
    phone: '+33 6 22 33 44 55',
    bio: 'Développeuse Angular & UX Engineer. Je combine expertise technique et sensibilité design pour créer des interfaces accessibles et performantes.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-02-20'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 6 },
      { id: 's2', name: 'SASS', category: 'frontend', level: 'expert', yearsOfExperience: 8 },
      { id: 's3', name: 'Storybook', category: 'frontend', level: 'advanced', yearsOfExperience: 4 },
      { id: 's4', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 6 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'UX Engineer',
        company: 'Design System Co.',
        location: 'Strasbourg',
        startDate: new Date('2021-04-01'),
        isCurrent: true,
        description: 'Création et maintenance d\'un design system Angular',
        technologies: ['Angular', 'SASS', 'Storybook']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance', 'consulting'],
      startDate: '2024-05-01',
      dailyRate: '640€',
      workPreference: 'remote',
      missionDuration: '3-6 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 29,
    rating: 4.8,
    reviewsCount: 29,
    recommendationsCount: 5,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais', 'Allemand']
  },
  {
    id: 'expert-011',
    email: 'marc.fontaine@example.com',
    role: 'expert',
    firstName: 'Marc',
    lastName: 'Fontaine',
    avatar: 'https://randomuser.me/api/portraits/men/34.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Marseille, France',
    city: 'Marseille',
    phone: '+33 6 33 44 55 66',
    bio: 'Expert Angular & GraphQL. Spécialisé dans les architectures serverless et les APIs modernes. Contributeur open source actif.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-01-30'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 8 },
      { id: 's2', name: 'GraphQL', category: 'backend', level: 'expert', yearsOfExperience: 5 },
      { id: 's3', name: 'Apollo', category: 'frontend', level: 'advanced', yearsOfExperience: 4 },
      { id: 's4', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 8 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Lead Frontend Developer',
        company: 'StartupSud',
        location: 'Marseille',
        startDate: new Date('2018-09-01'),
        isCurrent: true,
        description: 'Architecture et développement d\'applications Angular avec GraphQL',
        technologies: ['Angular', 'GraphQL', 'Apollo', 'NestJS']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance', 'consulting'],
      startDate: '2024-03-15',
      dailyRate: '700€',
      workPreference: 'remote',
      missionDuration: '3-6 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 44,
    rating: 4.7,
    reviewsCount: 44,
    recommendationsCount: 9,
    responseRate: 95,
    responseTime: '3h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-012',
    email: 'yasmine.chadi@example.com',
    role: 'expert',
    firstName: 'Yasmine',
    lastName: 'Chadi',
    avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Lyon, France',
    city: 'Lyon',
    phone: '+33 6 44 55 66 77',
    bio: 'Développeuse Angular avec une forte expertise en testing (Cypress, Jest, Playwright). Je garantis la qualité des applications à chaque étape du développement.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-02-05'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 6 },
      { id: 's2', name: 'Cypress', category: 'testing', level: 'expert', yearsOfExperience: 4 },
      { id: 's3', name: 'Jest', category: 'testing', level: 'expert', yearsOfExperience: 5 },
      { id: 's4', name: 'Playwright', category: 'testing', level: 'advanced', yearsOfExperience: 2 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'QA & Frontend Engineer',
        company: 'QualityFirst',
        location: 'Lyon',
        startDate: new Date('2021-01-01'),
        isCurrent: true,
        description: 'Tests E2E et unitaires sur des applications Angular',
        technologies: ['Angular', 'Cypress', 'Jest', 'Playwright']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance', 'mentoring'],
      startDate: '2024-04-15',
      dailyRate: '650€',
      workPreference: 'hybrid',
      missionDuration: '3-6 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 22,
    rating: 5.0,
    reviewsCount: 22,
    recommendationsCount: 4,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-013',
    email: 'nicolas.petit@example.com',
    role: 'expert',
    firstName: 'Nicolas',
    lastName: 'Petit',
    avatar: 'https://randomuser.me/api/portraits/men/35.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Rennes, France',
    city: 'Rennes',
    phone: '+33 6 55 66 77 88',
    bio: 'Développeur Angular / NestJS full-stack. Passionné par les architectures DDD et CQRS. J\'aide les équipes à structurer des applications robustes et maintenables.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-03-10'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 7 },
      { id: 's2', name: 'NestJS', category: 'backend', level: 'expert', yearsOfExperience: 5 },
      { id: 's3', name: 'PostgreSQL', category: 'backend', level: 'advanced', yearsOfExperience: 6 },
      { id: 's4', name: 'Docker', category: 'devops', level: 'advanced', yearsOfExperience: 4 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Full-Stack Lead Developer',
        company: 'Rennes Tech',
        location: 'Rennes',
        startDate: new Date('2019-06-01'),
        isCurrent: true,
        description: 'Développement full-stack Angular/NestJS avec architecture DDD',
        technologies: ['Angular', 'NestJS', 'PostgreSQL', 'Docker']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance', 'consulting'],
      startDate: '2024-05-01',
      dailyRate: '680€',
      workPreference: 'hybrid',
      missionDuration: '6-12 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 35,
    rating: 4.8,
    reviewsCount: 35,
    recommendationsCount: 6,
    responseRate: 97,
    responseTime: '2h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-014',
    email: 'amira.zaidi@example.com',
    role: 'expert',
    firstName: 'Amira',
    lastName: 'Zaidi',
    avatar: 'https://randomuser.me/api/portraits/women/53.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Paris, France',
    city: 'Paris',
    phone: '+33 6 66 77 88 99',
    bio: 'Développeuse Angular spécialisée en internationalisation (i18n) et accessibilité (a11y). Je crée des applications inclusives pour des millions d\'utilisateurs dans le monde.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-01-15'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 6 },
      { id: 's2', name: 'i18n', category: 'frontend', level: 'expert', yearsOfExperience: 5 },
      { id: 's3', name: 'WCAG', category: 'frontend', level: 'expert', yearsOfExperience: 5 },
      { id: 's4', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 6 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Senior Frontend Developer',
        company: 'Global Platform',
        location: 'Paris',
        startDate: new Date('2020-09-01'),
        isCurrent: true,
        description: 'Applications Angular multilingues et accessibles',
        technologies: ['Angular', 'i18n', 'ARIA', 'TypeScript']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance', 'consulting'],
      startDate: '2024-06-01',
      dailyRate: '660€',
      workPreference: 'remote',
      missionDuration: '3-6 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 27,
    rating: 4.9,
    reviewsCount: 27,
    recommendationsCount: 5,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais', 'Arabe']
  },
  {
    id: 'expert-015',
    email: 'julien.rousseau@example.com',
    role: 'expert',
    firstName: 'Julien',
    lastName: 'Rousseau',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Bordeaux, France',
    city: 'Bordeaux',
    phone: '+33 6 77 88 99 00',
    bio: 'Architecte Angular & DevOps. Je combine expertise frontend et infrastructure pour délivrer des applications performantes avec des pipelines CI/CD robustes.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-02-28'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 8 },
      { id: 's2', name: 'GitHub Actions', category: 'devops', level: 'expert', yearsOfExperience: 4 },
      { id: 's3', name: 'Azure', category: 'devops', level: 'advanced', yearsOfExperience: 5 },
      { id: 's4', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 8 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Angular Architect & DevOps',
        company: 'CloudFirst',
        location: 'Bordeaux',
        startDate: new Date('2018-03-01'),
        isCurrent: true,
        description: 'Architecture Angular et mise en place de pipelines CI/CD',
        technologies: ['Angular', 'Azure', 'GitHub Actions', 'Docker']
      }
    ],
    certifications: [
      {
        id: 'c1',
        name: 'Azure Developer Associate',
        issuer: 'Microsoft',
        dateObtained: new Date('2023-04-01')
      }
    ],
    availability: {
      types: ['consulting', 'freelance'],
      startDate: '2024-04-01',
      dailyRate: '780€',
      workPreference: 'remote',
      missionDuration: '1-3 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 61,
    rating: 4.8,
    reviewsCount: 61,
    recommendationsCount: 10,
    responseRate: 96,
    responseTime: '4h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-016',
    email: 'claire.nguyen@example.com',
    role: 'expert',
    firstName: 'Claire',
    lastName: 'Nguyen',
    avatar: 'https://randomuser.me/api/portraits/women/54.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Nantes, France',
    city: 'Nantes',
    phone: '+33 6 88 99 00 11',
    bio: 'Développeuse Angular senior avec focus sur la performance et les Web Vitals. J\'optimise des applications existantes et accompagne les équipes dans la montée en compétences.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-01-22'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 7 },
      { id: 's2', name: 'Web Vitals', category: 'frontend', level: 'expert', yearsOfExperience: 4 },
      { id: 's3', name: 'Lighthouse', category: 'frontend', level: 'expert', yearsOfExperience: 4 },
      { id: 's4', name: 'RxJS', category: 'frontend', level: 'advanced', yearsOfExperience: 5 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Performance Engineer',
        company: 'PerfLab',
        location: 'Nantes',
        startDate: new Date('2020-02-01'),
        isCurrent: true,
        description: 'Audit et optimisation de performances Angular',
        technologies: ['Angular', 'Lighthouse', 'Chrome DevTools']
      }
    ],
    certifications: [],
    availability: {
      types: ['consulting', 'mentoring'],
      startDate: '2024-05-15',
      dailyRate: '710€',
      workPreference: 'hybrid',
      missionDuration: '1-3 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 33,
    rating: 4.9,
    reviewsCount: 33,
    recommendationsCount: 7,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais', 'Vietnamien']
  },
  {
    id: 'expert-017',
    email: 'pierre.dumont@example.com',
    role: 'expert',
    firstName: 'Pierre',
    lastName: 'Dumont',
    avatar: 'https://randomuser.me/api/portraits/men/37.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Paris, France',
    city: 'Paris',
    phone: '+33 6 99 00 11 22',
    bio: 'Développeur Angular & Signal expert. À la pointe des nouveautés Angular (Signals, SSR, Deferrable Views). Je forme les équipes aux meilleures pratiques modernes.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-03-05'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 9 },
      { id: 's2', name: 'Angular Signals', category: 'frontend', level: 'expert', yearsOfExperience: 2 },
      { id: 's3', name: 'SSR', category: 'frontend', level: 'expert', yearsOfExperience: 4 },
      { id: 's4', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 9 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Angular Core Expert',
        company: 'Freelance',
        location: 'Paris',
        startDate: new Date('2015-01-01'),
        isCurrent: true,
        description: 'Expert Angular freelance et formateur certifié',
        technologies: ['Angular', 'Signals', 'SSR', 'TypeScript']
      }
    ],
    certifications: [
      {
        id: 'c1',
        name: 'Google Developer Expert - Angular',
        issuer: 'Google',
        dateObtained: new Date('2022-10-01')
      }
    ],
    availability: {
      types: ['freelance', 'mentoring', 'consulting'],
      startDate: '2024-03-01',
      dailyRate: '850€',
      workPreference: 'remote',
      missionDuration: '1-6 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 95,
    rating: 5.0,
    reviewsCount: 95,
    recommendationsCount: 20,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-018',
    email: 'fatou.diallo@example.com',
    role: 'expert',
    firstName: 'Fatou',
    lastName: 'Diallo',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Toulouse, France',
    city: 'Toulouse',
    phone: '+33 6 00 11 22 33',
    bio: 'Développeuse Angular & Firebase spécialisée dans les applications temps réel. Experte en architecture Jamstack et en déploiement cloud.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-02-12'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 6 },
      { id: 's2', name: 'Firebase', category: 'backend', level: 'expert', yearsOfExperience: 5 },
      { id: 's3', name: 'Firestore', category: 'backend', level: 'expert', yearsOfExperience: 5 },
      { id: 's4', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 6 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Angular & Firebase Developer',
        company: 'RealtimeCo',
        location: 'Toulouse',
        startDate: new Date('2021-06-01'),
        isCurrent: true,
        description: 'Applications Angular temps réel avec Firebase',
        technologies: ['Angular', 'Firebase', 'Firestore', 'Cloud Functions']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance'],
      startDate: '2024-04-01',
      dailyRate: '630€',
      workPreference: 'remote',
      missionDuration: '3-12 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 19,
    rating: 4.8,
    reviewsCount: 19,
    recommendationsCount: 3,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-019',
    email: 'alexis.garnier@example.com',
    role: 'expert',
    firstName: 'Alexis',
    lastName: 'Garnier',
    avatar: 'https://randomuser.me/api/portraits/men/38.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Montpellier, France',
    city: 'Montpellier',
    phone: '+33 6 12 11 22 33',
    bio: 'Expert Angular & Tailwind CSS avec une forte sensibilité UI. Je transforme des maquettes Figma en interfaces Angular pixel-perfect avec des animations fluides.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-03-15'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 5 },
      { id: 's2', name: 'Tailwind CSS', category: 'frontend', level: 'expert', yearsOfExperience: 4 },
      { id: 's3', name: 'Figma', category: 'design', level: 'advanced', yearsOfExperience: 5 },
      { id: 's4', name: 'GSAP', category: 'frontend', level: 'advanced', yearsOfExperience: 3 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Frontend UI Developer',
        company: 'PixelPerfect',
        location: 'Montpellier',
        startDate: new Date('2022-01-01'),
        isCurrent: true,
        description: 'Intégration Figma vers Angular avec animations avancées',
        technologies: ['Angular', 'Tailwind CSS', 'GSAP', 'Figma']
      }
    ],
    certifications: [],
    availability: {
      types: ['freelance', 'consulting'],
      startDate: '2024-05-01',
      dailyRate: '590€',
      workPreference: 'remote',
      missionDuration: '1-6 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 16,
    rating: 4.7,
    reviewsCount: 16,
    recommendationsCount: 3,
    responseRate: 94,
    responseTime: '5h',
    languages: ['Français', 'Anglais']
  },
  {
    id: 'expert-020',
    email: 'pauline.lecomte@example.com',
    role: 'expert',
    firstName: 'Pauline',
    lastName: 'Lecomte',
    avatar: 'https://randomuser.me/api/portraits/women/56.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    location: 'Lille, France',
    city: 'Lille',
    phone: '+33 6 23 34 45 56',
    bio: 'Tech Lead Angular avec 10 ans d\'expérience. Spécialisée dans la transformation digitale des grands groupes et le coaching d\'équipes de développement.',
    verificationStatus: 'verified',
    verifiedAt: new Date('2024-01-08'),
    skills: [
      { id: 's1', name: 'Angular', category: 'frontend', level: 'expert', yearsOfExperience: 10 },
      { id: 's2', name: 'TypeScript', category: 'frontend', level: 'expert', yearsOfExperience: 10 },
      { id: 's3', name: 'NgRx', category: 'frontend', level: 'expert', yearsOfExperience: 7 },
      { id: 's4', name: 'Architecture', category: 'frontend', level: 'expert', yearsOfExperience: 8 }
    ],
    experience: [
      {
        id: 'e1',
        title: 'Tech Lead Angular',
        company: 'Capgemini',
        location: 'Lille',
        startDate: new Date('2014-09-01'),
        isCurrent: true,
        description: 'Lead technique sur des projets Angular à grande échelle',
        technologies: ['Angular', 'TypeScript', 'NgRx', 'Micro-frontends']
      }
    ],
    certifications: [
      {
        id: 'c1',
        name: 'AWS Solutions Architect',
        issuer: 'Amazon',
        dateObtained: new Date('2023-02-01')
      }
    ],
    availability: {
      types: ['consulting', 'mentoring'],
      startDate: '2024-06-01',
      dailyRate: '900€',
      workPreference: 'hybrid',
      missionDuration: '3-12 mois'
    },
    isAvailable: true,
    isPublic: true,
    projectsCompleted: 112,
    rating: 5.0,
    reviewsCount: 112,
    recommendationsCount: 22,
    responseRate: 100,
    responseTime: '1h',
    languages: ['Français', 'Anglais']
  }
];

async function seedExperts() {
  console.log('🌱 Début du seeding des experts...\n');

  try {
    for (const expertData of expertsData) {
      const expertRef = doc(db, 'users', expertData.id);
      await setDoc(expertRef, expertData);
      console.log(`✅ Expert ajouté : ${expertData.firstName} ${expertData.lastName} (${expertData.city})`);
    }

    console.log(`\n🎉 ${expertsData.length} experts ont été ajoutés avec succès !`);
    console.log('\n📊 Répartition par ville :');

    const cities = expertsData.reduce((acc, expert) => {
      acc[expert.city] = (acc[expert.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(cities).forEach(([city, count]) => {
      console.log(`   - ${city}: ${count} expert(s)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

// Exécuter le seeding
seedExperts();
