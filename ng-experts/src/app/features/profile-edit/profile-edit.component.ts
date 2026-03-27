import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardLayout, RichTextEditorComponent } from '@shared/components';
import { Auth } from '@core/services/auth.service';
import { StorageService } from '@core/services/storage.service';
import { Expert, Skill, Experience, Certification, Availability, Education } from '@core/models/user.model';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DashboardLayout, RichTextEditorComponent]
})
export class ProfileEdit implements OnInit {
  private auth = inject(Auth);
  private storage = inject(StorageService);
  private fb = inject(FormBuilder);

  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  // Formulaires — initialisé dans ngOnInit (même pattern que RecruiterProfileEdit)
  protected profileForm!: FormGroup;
  protected passwordForm!: FormGroup;

  // Upload avatar signals
  protected readonly isUploadingAvatar = signal(false);
  protected readonly uploadProgress = signal(0);
  protected readonly avatarPreview = signal<string | null>(null);

  // Signals for add forms management selon bonnes pratiques
  protected readonly isAddingSkill = signal(false);
  protected readonly isAddingCertification = signal(false);
  protected readonly isAddingExperience = signal(false);
  protected readonly isAddingEducation = signal(false);
  protected readonly isEditingExperience = signal<string | null>(null);
  protected readonly isEditingEducation = signal<string | null>(null);
  protected readonly newSkillName = signal('');
  protected readonly newCertification = signal({ name: '', issuer: '', dateObtained: '' });
  protected readonly newExperience = signal({
    title: '',
    company: '',
    description: '',
    technologies: [],
    startDate: '',
    endDate: ''
  });
  protected readonly editExperience = signal({
    id: '',
    title: '',
    company: '',
    description: '',
    technologies: [] as string[],
    startDate: '',
    endDate: ''
  });
  protected readonly newEducation = signal({
    degree: '',
    school: '',
    fieldOfStudy: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  protected readonly editEducation = signal({
    id: '',
    degree: '',
    school: '',
    fieldOfStudy: '',
    description: '',
    startDate: '',
    endDate: ''
  });

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

  // Avatar de l'utilisateur pour l'affichage (preview locale en priorité)
  protected readonly userAvatar = computed(() => {
    const preview = this.avatarPreview();
    if (preview) return preview;
    const user = this.currentUser();
    return user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.firstName || 'U'))}&background=EC4899&color=fff&size=200`;
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

  private toTimestamp(value: any): number {
    if (!value) return 0;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'object' && 'seconds' in value) return value.seconds * 1000;
    return new Date(value).getTime() || 0;
  }

  // Expériences depuis le profil expert ou valeurs par défaut
  protected readonly experiences = computed(() => {
    const expert = this.expertProfile();
    const exp = expert?.experience || [];
    return [...exp].sort((a, b) => this.toTimestamp(b.startDate) - this.toTimestamp(a.startDate));
  });

  // Éducation depuis le profil expert ou valeurs par défaut
  protected readonly education = computed(() => {
    const expert = this.expertProfile();
    const edu = expert?.education || [];
    return [...edu].sort((a, b) => this.toTimestamp(b.startDate) - this.toTimestamp(a.startDate));
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

  // Toggle TJM visible publiquement
  protected readonly showDailyRate = signal(true);

  protected initShowDailyRate(): void {
    // Si le profil a un TJM, on l'affiche par défaut
    const rate = this.availability().dailyRate;
    this.showDailyRate.set(!!rate);
  }


  protected readonly countries = signal([
    'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola', 'Antigua-et-Barbuda',
    'Arabie Saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan',
    'Bahamas', 'Bahreïn', 'Bangladesh', 'Barbade', 'Bélarus', 'Belgique', 'Belize', 'Bénin',
    'Bhoutan', 'Bolivie', 'Bosnie-Herzégovine', 'Botswana', 'Brésil', 'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi',
    'Cambodge', 'Cameroun', 'Canada', 'Cap-Vert', 'Centrafrique', 'Chili', 'Chine', 'Chypre', 'Colombie',
    'Comores', 'Congo', 'Corée du Nord', 'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire', 'Croatie', 'Cuba',
    'Danemark', 'Djibouti', 'Dominique',
    'Égypte', 'El Salvador', 'Émirats Arabes Unis', 'Équateur', 'Érythrée', 'Espagne', 'Estonie', 'Eswatini', 'États-Unis', 'Éthiopie',
    'Fidji', 'Finlande', 'France',
    'Gabon', 'Gambie', 'Géorgie', 'Ghana', 'Grèce', 'Grenade', 'Guatemala', 'Guinée', 'Guinée-Bissau', 'Guinée équatoriale', 'Guyana',
    'Haïti', 'Honduras', 'Hongrie',
    'Îles Marshall', 'Îles Salomon', 'Inde', 'Indonésie', 'Irak', 'Iran', 'Irlande', 'Islande', 'Israël', 'Italie',
    'Jamaïque', 'Japon', 'Jordanie',
    'Kazakhstan', 'Kenya', 'Kirghizstan', 'Kiribati', 'Kosovo', 'Koweït',
    'Laos', 'Lesotho', 'Lettonie', 'Liban', 'Liberia', 'Libye', 'Liechtenstein', 'Lituanie', 'Luxembourg',
    'Macédoine du Nord', 'Madagascar', 'Malaisie', 'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Maurice', 'Mauritanie',
    'Mexique', 'Micronésie', 'Moldavie', 'Monaco', 'Mongolie', 'Monténégro', 'Mozambique', 'Myanmar',
    'Namibie', 'Nauru', 'Népal', 'Nicaragua', 'Niger', 'Nigéria', 'Norvège', 'Nouvelle-Zélande',
    'Oman', 'Ouganda', 'Ouzbékistan',
    'Pakistan', 'Palaos', 'Palestine', 'Panama', 'Papouasie-Nouvelle-Guinée', 'Paraguay', 'Pays-Bas', 'Pérou', 'Philippines', 'Pologne',
    'Portugal',
    'Qatar',
    'République démocratique du Congo', 'République dominicaine', 'République tchèque', 'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda',
    'Saint-Kitts-et-Nevis', 'Saint-Marin', 'Saint-Vincent-et-les-Grenadines', 'Sainte-Lucie', 'Salvador', 'Samoa',
    'São Tomé-et-Príncipe', 'Sénégal', 'Serbie', 'Seychelles', 'Sierra Leone', 'Singapour', 'Slovaquie', 'Slovénie',
    'Somalie', 'Soudan', 'Soudan du Sud', 'Sri Lanka', 'Suède', 'Suisse', 'Suriname', 'Syrie',
    'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande', 'Timor oriental', 'Togo', 'Tonga', 'Trinité-et-Tobago', 'Tunisie',
    'Turkménistan', 'Turquie', 'Tuvalu',
    'Ukraine', 'Uruguay',
    'Vanuatu', 'Vatican', 'Venezuela', 'Vietnam',
    'Yémen',
    'Zambie', 'Zimbabwe'
  ]);
  protected readonly workPreferences = signal([
    'Remote uniquement',
    'Hybride (2-3 jours/semaine)',
    'Sur site',
    'Flexible'
  ]);
  protected readonly missionDurations = signal(['3-6 mois', '6-12 mois', '12+ mois', 'Flexible']);
  protected readonly yearsOfExperience = signal(['1-3 ans', '3-5 ans', '5-10 ans', '10+ ans']);

  ngOnInit(): void {
    // Initialiser les formulaires IMMÉDIATEMENT (comme RecruiterProfileEdit)
    // pour éviter que profileForm soit undefined dans le template
    this.initializeForms();

    // Puis, en arrière-plan, attendre l'auth et re-patcher le formulaire
    this.auth.waitForUser().then(() => {
      const expert = this.expertProfile();
      if (expert) {
        this.profileForm.patchValue({
          firstName: expert.firstName || '',
          lastName:  expert.lastName  || '',
          title:     expert.title     || '',
          company:   expert.company   || '',
          location:  expert.location  || '',
          city:      expert.city      || '',
          email:     expert.email     || '',
          phone:     expert.phone     || '',
          address:   (expert as any).address || '',
          bio:       expert.bio       || ''
        });
      }
    });
  }

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

  private initializeForms(): void {
    const expert = this.expertProfile();

    this.profileForm = this.fb.group({
      firstName: [expert?.firstName || '', [Validators.required]],
      lastName:  [expert?.lastName || '', [Validators.required]],
      title:     [expert?.title || ''],
      company:   [expert?.company || ''],
      location:  [expert?.location || '', [Validators.required]],
      city:      [expert?.city || '', [Validators.required]],
      email:     [expert?.email || '', [Validators.required, Validators.email]],
      phone:     [expert?.phone || ''],
      address:   [(expert as any)?.address || ''],
      bio:       [expert?.bio || '']
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
      this.newExperience.set({ title: '', company: '', description: '', technologies: [], startDate: '', endDate: '' });
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

    const newExperience: any = {
      id: Date.now().toString(),
      title: exp.title.trim(),
      company: exp.company.trim(),
      location: 'Remote',
      startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
      description: exp.description.trim(),
      technologies: exp.technologies,
      isCurrent: !exp.endDate
    };
    if (exp.endDate) {
      newExperience.endDate = new Date(exp.endDate);
    }

    const updatedExperience = [...(expert.experience || []), newExperience];

    await this.auth.updateExpertProfile({ experience: updatedExperience });
    this.isAddingExperience.set(false);
    this.newExperience.set({ title: '', company: '', description: '', technologies: [], startDate: '', endDate: '' });
  }

  protected async removeExperience(expId: string): Promise<void> {
    const expert = this.expertProfile();
    if (!expert) return;

    const updatedExperience = expert.experience?.filter(exp => exp.id !== expId) || [];

    await this.auth.updateExpertProfile({ experience: updatedExperience });
  }

  protected startEditExperience(exp: Experience): void {
    this.isEditingExperience.set(exp.id);
    this.editExperience.set({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      description: exp.description,
      technologies: exp.technologies || [],
      startDate: exp.startDate ? this.formatDateForInput(this.toDate(exp.startDate)) : '',
      endDate: exp.endDate ? this.formatDateForInput(this.toDate(exp.endDate)) : ''
    });
  }

  protected cancelEditExperience(): void {
    this.isEditingExperience.set(null);
    this.editExperience.set({
      id: '',
      title: '',
      company: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: ''
    });
  }

  protected updateEditExperience(field: string, value: string | string[]): void {
    this.editExperience.update(current => ({ ...current, [field]: value }));
  }

  protected async confirmEditExperience(): Promise<void> {
    const exp = this.editExperience();
    if (!exp.title.trim() || !exp.company.trim() || !exp.description.trim()) return;

    const expert = this.expertProfile();
    if (!expert) return;

    const updatedExperience = expert.experience?.map(e => {
      if (e.id !== exp.id) return e;

      const { endDate: _removed, ...rest } = e as any;
      const updated: any = {
        ...rest,
        title: exp.title.trim(),
        company: exp.company.trim(),
        description: exp.description.trim(),
        startDate: exp.startDate ? new Date(exp.startDate) : e.startDate,
        technologies: exp.technologies,
        isCurrent: !exp.endDate
      };

      if (exp.endDate) {
        updated.endDate = new Date(exp.endDate);
      }

      return updated;
    }) || [];

    await this.auth.updateExpertProfile({ experience: updatedExperience });
    this.cancelEditExperience();
  }

  private formatDateForInput(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Methods for education management
  protected toggleAddEducation(): void {
    this.isAddingEducation.update(current => !current);
    if (!this.isAddingEducation()) {
      this.newEducation.set({ degree: '', school: '', fieldOfStudy: '', description: '', startDate: '', endDate: '' });
    }
  }

  protected updateNewEducation(field: string, value: string): void {
    this.newEducation.update(current => ({ ...current, [field]: value }));
  }

  protected async confirmAddEducation(): Promise<void> {
    const edu = this.newEducation();
    if (!edu.degree.trim() || !edu.school.trim() || !edu.fieldOfStudy.trim()) return;

    const expert = this.expertProfile();
    if (!expert) return;

    const newEducation: any = {
      id: Date.now().toString(),
      degree: edu.degree.trim(),
      school: edu.school.trim(),
      fieldOfStudy: edu.fieldOfStudy.trim(),
      startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
      description: edu.description?.trim() || '',
      isCurrent: !edu.endDate
    };
    if (edu.endDate) {
      newEducation.endDate = new Date(edu.endDate);
    }

    const updatedEducation = [...(expert.education || []), newEducation];

    await this.auth.updateExpertProfile({ education: updatedEducation });
    this.isAddingEducation.set(false);
    this.newEducation.set({ degree: '', school: '', fieldOfStudy: '', description: '', startDate: '', endDate: '' });
  }

  protected async removeEducation(eduId: string): Promise<void> {
    const expert = this.expertProfile();
    if (!expert) return;

    const updatedEducation = expert.education?.filter(edu => edu.id !== eduId) || [];

    await this.auth.updateExpertProfile({ education: updatedEducation });
  }

  protected startEditEducation(edu: Education): void {
    this.isEditingEducation.set(edu.id);
    this.editEducation.set({
      id: edu.id,
      degree: edu.degree,
      school: edu.school,
      fieldOfStudy: edu.fieldOfStudy,
      description: edu.description || '',
      startDate: edu.startDate ? this.formatDateForInput(this.toDate(edu.startDate)) : '',
      endDate: edu.endDate ? this.formatDateForInput(this.toDate(edu.endDate)) : ''
    });
  }

  protected cancelEditEducation(): void {
    this.isEditingEducation.set(null);
    this.editEducation.set({
      id: '',
      degree: '',
      school: '',
      fieldOfStudy: '',
      description: '',
      startDate: '',
      endDate: ''
    });
  }

  protected updateEditEducation(field: string, value: string): void {
    this.editEducation.update(current => ({ ...current, [field]: value }));
  }

  protected async confirmEditEducation(): Promise<void> {
    const edu = this.editEducation();
    if (!edu.degree.trim() || !edu.school.trim()) return;

    const expert = this.expertProfile();
    if (!expert) return;

    const updatedEducation = expert.education?.map(e => {
      if (e.id !== edu.id) return e;

      const { endDate: _removed, ...rest } = e as any;
      const updated: any = {
        ...rest,
        degree: edu.degree.trim(),
        school: edu.school.trim(),
        fieldOfStudy: edu.fieldOfStudy.trim(),
        description: edu.description.trim(),
        startDate: edu.startDate ? new Date(edu.startDate) : e.startDate,
        isCurrent: !edu.endDate
      };

      if (edu.endDate) {
        updated.endDate = new Date(edu.endDate);
      }

      return updated;
    }) || [];

    await this.auth.updateExpertProfile({ education: updatedEducation });
    this.cancelEditEducation();
  }

  // Avatar management
  protected onAvatarUpload(): void {
    this.avatarInput?.nativeElement?.click();
  }

  protected async onAvatarFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Valider le type et la taille
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.error.set('Format non autorisé. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('La taille du fichier dépasse la limite de 5 MB.');
      return;
    }

    // Afficher une preview locale immédiatement
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Récupérer l'utilisateur
    const user = this.auth.getCurrentUser()();
    if (!user) {
      this.error.set('Utilisateur non connecté.');
      return;
    }

    this.isUploadingAvatar.set(true);
    this.uploadProgress.set(0);
    this.error.set(null);
    this.success.set(null);

    try {
      // Supprimer l'ancien avatar si c'est une URL Firebase Storage
      const currentAvatar = user.avatar;
      if (currentAvatar && currentAvatar.includes('firebasestorage')) {
        await this.storage.deleteFileByURL(currentAvatar);
      }

      // Uploader le nouveau fichier
      const downloadURL = await this.storage.uploadAvatar(
        file,
        user.id,
        (progress) => this.uploadProgress.set(progress)
      );

      // Sauvegarder l'URL dans Firestore
      await this.auth.updateExpertProfile({ avatar: downloadURL });
      this.avatarPreview.set(null);
      this.success.set('Photo de profil mise à jour avec succès !');

    } catch (err: any) {
      this.error.set(err.message || 'Erreur lors de l\'upload.');
      this.avatarPreview.set(null);
    } finally {
      this.isUploadingAvatar.set(false);
      this.uploadProgress.set(0);
      input.value = '';
    }
  }

  protected async onAvatarReset(): Promise<void> {
    const user = this.auth.getCurrentUser()();
    const name = user?.firstName || 'U';
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EC4899&color=fff&size=200`;

    // Supprimer l'ancien avatar Firebase Storage si existant
    const currentAvatar = user?.avatar;
    if (currentAvatar && currentAvatar.includes('firebasestorage')) {
      await this.storage.deleteFileByURL(currentAvatar);
    }

    this.avatarPreview.set(null);
    await this.auth.updateExpertProfile({ avatar: defaultAvatar });
    this.success.set('Photo de profil réinitialisée.');
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
        title: formData.title || undefined,
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

  protected async onAvailabilityFieldChange(field: keyof Availability, value: string): Promise<void> {
    const expert = this.expertProfile();
    if (!expert) return;

    const currentAvailability = expert.availability || {
      types: [],
      startDate: '',
      dailyRate: '',
      workPreference: 'remote' as const,
      missionDuration: ''
    };

    const updatedAvailability: Availability = {
      ...currentAvailability,
      [field]: value
    };

    await this.auth.updateExpertProfile({ availability: updatedAvailability });
  }

  protected isContractTypeSelected(type: string): boolean {
    const availability = this.availability();
    const validType = type as 'freelance' | 'mentoring' | 'consulting';
    return availability.types.some(t => t === validType);
  }

  protected async onAvailabilityStatusChange(isAvailable: boolean): Promise<void> {
    await this.auth.updateExpertProfile({ isAvailable });
  }

  protected async onYearsOfExperienceChange(years: string): Promise<void> {
    if (!years || years.trim() === '') return;
    await this.auth.updateExpertProfile({ yearsOfExperience: years });
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
