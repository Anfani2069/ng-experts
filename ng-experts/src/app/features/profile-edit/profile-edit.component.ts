import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardLayout } from '@shared/components';

export interface UserProfile {
  name: string;
  company: string;
  location: string;
  city: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  avatar: string;
  role: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Certification {
  id: string;
  title: string;
  organization: string;
  date: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface Availability {
  types: string[];
  startDate: string;
  dailyRate: string;
  workPreference: string;
  missionDuration: string;
}

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DashboardLayout]
})
export class ProfileEdit {
  
  // Profile form
  protected profileForm!: FormGroup;
  protected passwordForm!: FormGroup;

  // User data signals
  protected readonly currentUser = signal<UserProfile>({
    name: 'Mike Nielsen',
    company: 'Maxima Studio',
    location: 'France',
    city: 'Paris',
    email: 'info@ng-expert.com',
    phone: '+971 2345 65478',
    address: '123 Rue de la Paix, 75002 Paris, France',
    bio: 'Développeur Angular passionné avec 8 ans d\'expérience. Spécialisé dans les applications web modernes et scalables.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    role: 'Développeur'
  });

  protected readonly skills = signal<Skill[]>([
    { id: '1', name: 'Angular 17' },
    { id: '2', name: 'TypeScript' },
    { id: '3', name: 'RxJS' },
    { id: '4', name: 'NgRx' }
  ]);

  protected readonly certifications = signal<Certification[]>([
    {
      id: '1',
      title: 'Angular Certified Developer',
      organization: 'Google',
      date: 'Janvier 2024'
    },
    {
      id: '2',
      title: 'TypeScript Advanced Patterns',
      organization: 'Microsoft',
      date: 'Mars 2023'
    }
  ]);

  protected readonly experiences = signal<Experience[]>([
    {
      id: '1',
      title: 'Plateforme E-commerce Angular 17',
      company: 'Maxima Studio',
      period: 'Sept 2023 - Déc 2023',
      description: 'Développement d\'une plateforme e-commerce complète avec Angular 17, NgRx pour la gestion d\'état, et intégration de paiements Stripe. Plus de 50,000 utilisateurs actifs.',
      technologies: ['Angular 17', 'NgRx', 'Stripe API', 'TailwindCSS']
    },
    {
      id: '2',
      title: 'Application Mobile Ionic + Angular',
      company: 'TechCorp',
      period: 'Jan 2023 - Juin 2023',
      description: 'Création d\'une application mobile hybride pour la gestion de projets avec synchronisation offline et notifications push.',
      technologies: ['Ionic', 'Angular', 'Capacitor', 'Firebase']
    }
  ]);

  protected readonly availability = signal<Availability>({
    types: ['freelance', 'mentoring'],
    startDate: '2024-02-01',
    dailyRate: '500-600',
    workPreference: 'Remote uniquement',
    missionDuration: '3-6 mois'
  });


  protected readonly countries = signal(['France', 'Belgique', 'Suisse', 'Canada']);
  protected readonly workPreferences = signal([
    'Remote uniquement',
    'Hybride (2-3 jours/semaine)',
    'Sur site',
    'Flexible'
  ]);
  protected readonly missionDurations = signal(['3-6 mois', '6-12 mois', '12+ mois', 'Flexible']);

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

  private initializeForms(): void {
    const user = this.currentUser();
    
    this.profileForm = this.fb.group({
      name: [user.name, [Validators.required]],
      company: [user.company, [Validators.required]],
      location: [user.location, [Validators.required]],
      city: [user.city, [Validators.required]],
      email: [user.email, [Validators.required, Validators.email]],
      phone: [user.phone, [Validators.required]],
      address: [user.address],
      bio: [user.bio]
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
  protected addSkill(skillName: string): void {
    if (skillName.trim()) {
      const newSkill: Skill = {
        id: Date.now().toString(),
        name: skillName.trim()
      };
      this.skills.update(skills => [...skills, newSkill]);
    }
  }

  protected removeSkill(skillId: string): void {
    this.skills.update(skills => skills.filter(skill => skill.id !== skillId));
  }

  // Methods for certifications management
  protected addCertification(): void {
    // TODO: Open modal or form to add certification
    console.log('Add certification');
  }

  protected removeCertification(certId: string): void {
    this.certifications.update(certs => certs.filter(cert => cert.id !== certId));
  }

  // Methods for experience management
  protected addExperience(): void {
    // TODO: Open modal or form to add experience
    console.log('Add experience');
  }

  protected removeExperience(expId: string): void {
    this.experiences.update(exps => exps.filter(exp => exp.id !== expId));
  }

  // Avatar management
  protected onAvatarUpload(): void {
    // TODO: Implement avatar upload
    console.log('Upload avatar');
  }

  protected onAvatarReset(): void {
    const defaultAvatar = 'https://randomuser.me/api/portraits/men/32.jpg';
    this.currentUser.update(user => ({ ...user, avatar: defaultAvatar }));
  }

  // Form submissions
  protected onSaveProfile(): void {
    if (this.profileForm.valid) {
      const formData = this.profileForm.value;
      this.currentUser.update(user => ({ ...user, ...formData }));
      console.log('Profile saved:', formData);
      // TODO: API call to save profile
    } else {
      console.log('Form is invalid');
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
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
  protected onContractTypeChange(type: string, checked: boolean): void {
    this.availability.update(avail => {
      const types = checked 
        ? [...avail.types, type]
        : avail.types.filter(t => t !== type);
      return { ...avail, types };
    });
  }

  protected isContractTypeSelected(type: string): boolean {
    return this.availability().types.includes(type);
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
