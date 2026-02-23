import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardLayout } from '@shared/components';
import { Auth } from '@core/services/auth.service';
import { Recruiter } from '@core/models/user.model';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebase } from '@core/config/firebase.config';

@Component({
  selector: 'app-recruiter-profile-edit',
  templateUrl: './recruiter-profile-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DashboardLayout]
})
export class RecruiterProfileEdit implements OnInit {
  private auth = inject(Auth);
  private fb = inject(FormBuilder);

  protected profileForm!: FormGroup;

  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly success = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly currentUser = this.auth.getCurrentUser();

  protected readonly recruiterProfile = computed(() => {
    const user = this.currentUser();
    if (!user || user.role !== 'recruiter') return null;
    return user as Recruiter;
  });

  protected readonly userAvatar = computed(() => {
    const user = this.currentUser();
    return user?.avatar || 'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(`${user?.firstName || ''} ${user?.lastName || ''}`) +
      '&background=EC4899&color=fff';
  });

  protected readonly companySizes = signal([
    '1-10 employés',
    '11-50 employés',
    '51-200 employés',
    '201-500 employés',
    '500+ employés'
  ]);

  protected readonly industries = signal([
    'Technologie / IT',
    'Finance / Banque',
    'Santé',
    'Commerce / Retail',
    'Industrie',
    'Conseil',
    'Éducation',
    'Autre'
  ]);

  protected readonly countries = signal(['France', 'Belgique', 'Suisse', 'Canada', 'Luxembourg']);

  ngOnInit(): void {
    const recruiter = this.recruiterProfile();
    this.profileForm = this.fb.group({
      firstName:   [recruiter?.firstName || '',   [Validators.required, Validators.minLength(2)]],
      lastName:    [recruiter?.lastName || '',    [Validators.required, Validators.minLength(2)]],
      email:       [recruiter?.email || '',       [Validators.required, Validators.email]],
      company:     [recruiter?.company || '',     [Validators.required]],
      companySize: [recruiter?.companySize || ''],
      industry:    [recruiter?.industry || ''],
      location:    [recruiter?.location || 'France'],
      website:     [recruiter?.website || ''],
      phone:       [(recruiter as any)?.phone || ''],
    });
  }

  protected async onSave(): Promise<void> {
    if (this.profileForm.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const user = firebase.auth.currentUser;
      if (!user) throw new Error('Non connecté');

      const formValue = this.profileForm.value;

      // Nettoyer les champs vides
      const updateData: any = { updatedAt: serverTimestamp() };
      const fields = ['firstName', 'lastName', 'company', 'companySize', 'industry', 'location', 'website', 'phone'];
      fields.forEach(f => {
        if (formValue[f] !== undefined && formValue[f] !== '') {
          updateData[f] = formValue[f];
        }
      });

      await updateDoc(doc(firebase.firestore, 'users', user.uid), updateData);
      this.success.set('Profil mis à jour avec succès !');
      setTimeout(() => this.success.set(null), 3000);
    } catch (e: any) {
      this.error.set('Erreur lors de la sauvegarde. Veuillez réessayer.');
      console.error(e);
    } finally {
      this.isSaving.set(false);
    }
  }

  protected getFieldError(field: string): string | null {
    const ctrl = this.profileForm.get(field);
    if (ctrl?.invalid && ctrl?.touched) {
      if (ctrl.errors?.['required']) return 'Ce champ est requis';
      if (ctrl.errors?.['minlength']) return 'Trop court';
      if (ctrl.errors?.['email']) return 'Email invalide';
    }
    return null;
  }
}
