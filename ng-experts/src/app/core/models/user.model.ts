/**
 * Types d'utilisateurs sur la plateforme Ng-Expert
 */
export type UserRole = 'expert' | 'recruiter' | 'admin';

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

  // Système de réactivité (gel de profil)
  freezeStrikes?: number;          // Nombre de non-réponses (max 3 → gel)
  frozenUntil?: Date | any;        // Date de fin du gel (null = pas gelé)
  lastStrikeAt?: Date | any;       // Date du dernier strike

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
 * Modèle Administrateur
 * Super-utilisateur avec tous les droits de gestion
 */
export interface Admin extends BaseUser {
  role: 'admin';
  permissions?: string[];
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
/**
 * Notification applicative
 */
export interface AppNotification {
  id?: string;
  userId: string;
  type: 'message' | 'proposal' | 'proposal_accepted' | 'proposal_rejected' | 'mission_completed' | 'proposal_expired' | 'profile_frozen' | 'system';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: Date | any;
  // Données contextuelles
  refId?: string;   // ID de la proposition ou conversation liée
  fromName?: string;
  fromAvatar?: string;
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
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired';
  createdAt: Date;
  completedAt?: Date;
  expiresAt?: Date | any;  // Date limite de réponse (createdAt + 1h)
}

/**
 * Message dans une conversation
 */
export interface ChatMessage {
  id?: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: Date | any;
  read: boolean;
}

/**
 * Conversation entre un expert et un recruteur
 */
export interface Conversation {
  id?: string;
  participantIds: string[];          // [expertId, recruiterId]
  participants: {
    [userId: string]: {
      name: string;
      avatar?: string;
      role: 'expert' | 'recruiter';
    }
  };
  proposalId?: string;               // Lié à une proposition si applicable
  proposalTitle?: string;
  lastMessage?: string;
  lastMessageAt: Date | any;
  lastMessageSenderId?: string;
  unreadCount: { [userId: string]: number };
  createdAt: Date | any;
}

