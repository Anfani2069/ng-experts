import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Expert } from '@core/models/user.model';
import { Auth } from '@core/services/auth.service';
import { DashboardLayout } from '@shared/components/dashboard-layout/dashboard-layout.component';
import { SanitizeQuillPipe } from '@shared/pipes';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardLayout, SanitizeQuillPipe]
})
export class Profile {
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Utilisateur expert actuel ou depuis les paramètres de route
  protected readonly currentUser = this.auth.getCurrentUser();

  // Profil expert calculé depuis l'utilisateur connecté
  protected readonly expertProfile = computed(() => {
    const user = this.currentUser();
    if (!user || user.role !== 'expert') return null;
    return user as Expert;
  });

  // Avatar avec fallback
  protected readonly userAvatar = computed(() => {
    const expert = this.expertProfile();
    return expert?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg';
  });

  // Nom complet
  protected readonly fullName = computed(() => {
    const expert = this.expertProfile();
    return expert ? `${expert.firstName} ${expert.lastName}` : 'Expert Angular';
  });

  // Localisation complète
  protected readonly fullLocation = computed(() => {
    const expert = this.expertProfile();
    return expert ? `${expert.city}, ${expert.location}` : 'France';
  });

  // Statistiques calculées depuis les données expert
  protected readonly stats = computed(() => {
    const expert = this.expertProfile();
    return {
      projects: expert?.projectsCompleted || 0,
      certifications: expert?.certifications?.length || 0,
      skills: expert?.skills?.length || 0,
      rating: expert?.rating || 0
    };
  });

  // Statut de disponibilité
  protected readonly availabilityStatus = computed(() => {
    const expert = this.expertProfile();
    return expert?.isAvailable ? 'Disponible' : 'Non disponible';
  });

  /**
   * Convertir une date Firestore Timestamp en Date JavaScript
   * Retourne null si la date est invalide pour éviter les erreurs du DatePipe
   */
  protected toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Timestamp) return value.toDate();
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    // Gérer les objets Timestamp sérialisés (avec seconds et nanoseconds)
    if (typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      return new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
    }
    // Gérer les chaînes de date
    if (typeof value === 'string' && value.trim() !== '') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    // Gérer les timestamps numériques
    if (typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  // Navigation vers l'édition de profil
  protected onEditProfile(): void {
    this.router.navigate(['/profile-edit']);
  }
}
