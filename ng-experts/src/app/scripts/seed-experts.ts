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
