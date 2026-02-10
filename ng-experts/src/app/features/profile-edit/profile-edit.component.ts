import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardLayout } from '@shared/components';
import { Auth } from '@core/services/auth.service';
import { Expert, Skill, Experience, Certification, Availability } from '@core/models/user.model';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DashboardLayout]
})
export class ProfileEdit implements OnInit {
  private auth = inject(Auth);
  
  // User reactive forms
  protected profileForm!: FormGroup;
  protected passwordForm!: FormGroup;

  // Signals for add forms management selon bonnes pratiques
  protected readonly isAddingSkill = signal(false);
  protected readonly isAddingCertification = signal(false);
  protected readonly isAddingExperience = signal(false);
  protected readonly newSkillName = signal('');
  protected readonly newCertification = signal({ name: '', issuer: '', dateObtained: '' });
  protected readonly newExperience = signal({ title: '', company: '', description: '', technologies: [] });

  // État du composant
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  // Utilisateur connecté depuis Firebase
  protected readonly currentUser = this.auth.getCurrentUser();
  
  // Données expertes calculées depuis l'utilisateur connecté
  protected readonly expertProfile = computed(() => {
    const user = this.currentUser();
    if (!user || user.role !== 'expert') return null;
    
    return user as Expert;
  });

  // Avatar de l'utilisateur pour l'affichage
  protected readonly userAvatar = computed(() => {
    const user = this.currentUser();
    return user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg';
  });

  // Skills depuis le profil expert ou valeurs par défaut
  protected readonly skills = computed(() => {
    const expert = this.expertProfile();
    return expert?.skills || [];
  });

  // Certifications depuis le profil expert ou valeurs par défaut
  protected readonly certifications = computed(() => {
    const expert = this.expertProfile();
    return expert?.certifications || [];
  });

  // Expériences depuis le profil expert ou valeurs par défaut  
  protected readonly experiences = computed(() => {
    const expert = this.expertProfile();
    return expert?.experience || [];
  });

  // Disponibilité depuis le profil expert ou valeurs par défaut
  protected readonly availability = computed(() => {
    const expert = this.expertProfile();
    return expert?.availability || {
      types: [],
      startDate: '',
      dailyRate: '',
      workPreference: 'remote',
      missionDuration: ''
    };
  });


  protected readonly countries = signal(['France', 'Belgique', 'Suisse', 'Canada']);
  protected readonly workPreferences = signal([
    'Remote uniquement',
    'Hybride (2-3 jours/semaine)',
    'Sur site',
    'Flexible'
  ]);
  protected readonly missionDurations = signal(['3-6 mois', '6-12 mois', '12+ mois', 'Flexible']);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    const expert = this.expertProfile();
    
    this.profileForm = this.fb.group({
      firstName: [expert?.firstName || '', [Validators.required]],
      lastName: [expert?.lastName || '', [Validators.required]],
      company: [expert?.company || ''],
      location: [expert?.location || 'France', [Validators.required]],
      city: [expert?.city || 'Paris', [Validators.required]],
      email: [expert?.email || '', [Validators.required, Validators.email]],
      phone: [expert?.phone || ''],
      bio: [expert?.bio || '']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: any) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    return newPassword?.value === confirmPassword?.value ? null : { mismatch: true };
  }

  // Methods for skills management
  protected toggleAddSkill(): void {
    this.isAddingSkill.update(current => !current);
    if (!this.isAddingSkill()) {
      this.newSkillName.set('');
    }
  }

  protected updateNewSkillName(name: string): void {
    this.newSkillName.set(name);
  }

  protected async confirmAddSkill(): Promise<void> {
    const skillName = this.newSkillName().trim();
    if (!skillName) return;

    const expert = this.expertProfile();
    if (!expert) return;

    const newSkill: Skill = {
      id: Date.now().toString(),
      name: skillName,
      category: 'frontend',
      level: 'intermediate',
      yearsOfExperience: 2
    };

    const updatedSkills = [...(expert.skills || []), newSkill];
    
    await this.auth.updateExpertProfile({ skills: updatedSkills });
    this.isAddingSkill.set(false);
    this.newSkillName.set('');
  }

  protected async removeSkill(skillName: string): Promise<void> {
    const expert = this.expertProfile();
    if (!expert) return;

    const updatedSkills = expert.skills?.filter(skill => skill.name !== skillName) || [];
    
    await this.auth.updateExpertProfile({ skills: updatedSkills });
  }

  // Methods for certifications management
  protected toggleAddCertification(): void {
    this.isAddingCertification.update(current => !current);
    if (!this.isAddingCertification()) {
      this.newCertification.set({ name: '', issuer: '', dateObtained: '' });
    }
  }

  protected updateNewCertification(field: string, value: string): void {
    this.newCertification.update(current => ({ ...current, [field]: value }));
  }

  protected async confirmAddCertification(): Promise<void> {
    const cert = this.newCertification();
    if (!cert.name.trim() || !cert.issuer.trim() || !cert.dateObtained) return;

    const expert = this.expertProfile();
    if (!expert) return;

    const newCertification: Certification = {
      id: Date.now().toString(),
      name: cert.name.trim(),
      issuer: cert.issuer.trim(),
      dateObtained: new Date(cert.dateObtained),
      credentialId: '',
      credentialUrl: ''
    };

    const updatedCertifications = [...(expert.certifications || []), newCertification];
    
    await this.auth.updateExpertProfile({ certifications: updatedCertifications });
    this.isAddingCertification.set(false);
    this.newCertification.set({ name: '', issuer: '', dateObtained: '' });
  }

  protected async removeCertification(certId: string): Promise<void> {
    const expert = this.expertProfile();
    if (!expert) return;

    const updatedCertifications = expert.certifications?.filter(cert => cert.id !== certId) || [];
    
    await this.auth.updateExpertProfile({ certifications: updatedCertifications });
  }

  // Methods for experience management
  protected toggleAddExperience(): void {
    this.isAddingExperience.update(current => !current);
    if (!this.isAddingExperience()) {
      this.newExperience.set({ title: '', company: '', description: '', technologies: [] });
    }
  }

  protected updateNewExperience(field: string, value: string | string[]): void {
    this.newExperience.update(current => ({ ...current, [field]: value }));
  }

  protected async confirmAddExperience(): Promise<void> {
    const exp = this.newExperience();
    if (!exp.title.trim() || !exp.company.trim() || !exp.description.trim()) return;

    const expert = this.expertProfile();
    if (!expert) return;

    const newExperience: Experience = {
      id: Date.now().toString(),
      title: exp.title.trim(),
      company: exp.company.trim(),
      location: 'Remote', // Default value
      startDate: new Date(), // Default to today
      description: exp.description.trim(),
      technologies: exp.technologies,
      isCurrent: true
    };

    const updatedExperience = [...(expert.experience || []), newExperience];
    
    await this.auth.updateExpertProfile({ experience: updatedExperience });
    this.isAddingExperience.set(false);
    this.newExperience.set({ title: '', company: '', description: '', technologies: [] });
  }

  protected async removeExperience(expId: string): Promise<void> {
    const expert = this.expertProfile();
    if (!expert) return;

    const updatedExperience = expert.experience?.filter(exp => exp.id !== expId) || [];
    
    await this.auth.updateExpertProfile({ experience: updatedExperience });
  }

  // Avatar management
  protected onAvatarUpload(): void {
    // TODO: Implement avatar upload
    console.log('Upload avatar');
  }

  protected async onAvatarReset(): Promise<void> {
    const defaultAvatar = 'https://randomuser.me/api/portraits/men/32.jpg';
    
    await this.auth.updateExpertProfile({ avatar: defaultAvatar });
  }

  // Form submissions
  protected async onSaveProfile(): Promise<void> {
    if (!this.profileForm.valid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const formData = this.profileForm.value;
      const expertUpdate: Partial<Expert> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        location: formData.location,
        city: formData.city,
        phone: formData.phone,
        bio: formData.bio
      };

      const result = await this.auth.updateExpertProfile(expertUpdate);
      
      if (result.success) {
        this.success.set(result.message);
      } else {
        this.error.set(result.message);
      }

    } catch (error) {
      this.error.set('Erreur lors de la sauvegarde du profil');
      console.error('Erreur sauvegarde profil:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onChangePassword(): void {
    if (this.passwordForm.valid) {
      const formData = this.passwordForm.value;
      console.log('Password change requested');
      // TODO: API call to change password
      this.passwordForm.reset();
    } else {
      console.log('Password form is invalid');
    }
  }

  protected onCancel(): void {
    this.profileForm.reset();
    this.initializeForms();
  }

  // Availability management
  protected async onContractTypeChange(type: string, checked: boolean): Promise<void> {
    const expert = this.expertProfile();
    if (!expert) return;

    const currentAvailability = expert.availability || {
      types: [] as ('freelance' | 'mentoring' | 'consulting')[],
      startDate: '',
      dailyRate: '',
      workPreference: 'remote' as const,
      missionDuration: ''
    };

    const validType = type as 'freelance' | 'mentoring' | 'consulting';
    const types = checked 
      ? [...currentAvailability.types, validType]
      : currentAvailability.types.filter(t => t !== validType);

    const updatedAvailability: Availability = { ...currentAvailability, types };
    
    await this.auth.updateExpertProfile({ availability: updatedAvailability });
  }

  protected isContractTypeSelected(type: string): boolean {
    const availability = this.availability();
    const validType = type as 'freelance' | 'mentoring' | 'consulting';
    return availability.types.some(t => t === validType);
  }


  // Utility methods
  protected getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return 'Ce champ est requis';
      if (field.errors?.['email']) return 'Email invalide';
    }
    return null;
  }

  protected getPasswordError(fieldName: string): string | null {
    const field = this.passwordForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return 'Ce champ est requis';
      if (field.errors?.['minlength']) return 'Minimum 8 caractères';
    }
    if (fieldName === 'confirmPassword' && this.passwordForm.errors?.['mismatch']) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  }
}
