/**
 * Types d'utilisateurs sur la plateforme Ng-Expert
 */
export type UserRole = 'expert' | 'recruiter';

/**
 * Statuts de vérification pour les experts
 */
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

/**
 * Types d'abonnements pour les recruteurs
 */
export type SubscriptionType = 'monthly' | 'yearly';

/**
 * Interface de base pour tous les utilisateurs
 */
export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date | any;
  updatedAt: Date | any;
  isActive: boolean;
}

/**
 * Modèle Expert Angular
 * Profils vérifiés et limités, prêts à intervenir
 */
export interface Expert extends BaseUser {
  role: 'expert';

  // Informations professionnelles
  company?: string;
  location: string;
  city: string;
  phone?: string;
  bio: string;
  yearsOfExperience?: string; // Ex: "5-10 ans"

  // Vérification
  verificationStatus: VerificationStatus;
  verifiedAt?: Date;

  // Compétences techniques
  skills: Skill[];
  experience: Experience[];
  certifications: Certification[];
  education?: Education[];

  // Disponibilité
  availability: Availability;

  // Profil public
  isAvailable: boolean;
  isPublic: boolean;

  // Statistiques
  projectsCompleted: number;
  rating?: number;
  reviewsCount: number;
  recommendationsCount?: number;
  responseRate?: number;
  responseTime?: string;
  languages?: string[];
}

/**
 * Modèle Recruteur
 * Clients payants de la plateforme
 */
export interface Recruiter extends BaseUser {
  role: 'recruiter';

  // Informations entreprise
  company: string;
  companySize?: string;
  industry?: string;
  location: string;
  website?: string;

  // Abonnement
  subscription: Subscription;

  // Préférences de recherche
  searchPreferences?: SearchPreferences;

  // Historique
  contactedExperts: string[]; // IDs des experts contactés
  savedExperts: string[]; // IDs des experts sauvegardés
}

/**
 * Compétence technique
 */
export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'mobile' | 'devops' | 'testing' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
}

/**
 * Expérience professionnelle
 */
export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

/**
 * Certification
 */
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateObtained: Date;
  expirationDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

/**
 * Formation / Éducation
 */
export interface Education {
  id: string;
  degree: string;
  school: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  isCurrent: boolean;
}

/**
 * Disponibilité expert
 */
export interface Availability {
  types: ('freelance' | 'mentoring' | 'consulting')[];
  startDate: string;
  dailyRate: string;
  workPreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  missionDuration: string;
  hoursPerWeek?: number;
}

/**
 * Abonnement recruteur
 */
export interface Subscription {
  type: SubscriptionType;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  contactsRemaining: number;
  maxContacts: number;
  autoRenew: boolean;
}

/**
 * Préférences de recherche recruteur
 */
export interface SearchPreferences {
  preferredSkills: string[];
  experienceLevel: string[];
  location: string[];
  availability: string[];
  maxDailyRate?: number;
}
export interface Proposal {
  id?: string;
  expertId: string;
  clientId?: string; // ID of the logged in user if any, or null/generated
  clientEmail: string;
  title: string;
  description: string;
  budget: string;
  startDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
