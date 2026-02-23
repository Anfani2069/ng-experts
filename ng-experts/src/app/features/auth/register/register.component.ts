import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class Register {
  private auth = inject(Auth);

  protected readonly accountType = signal('developer');
  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly acceptTerms = signal(false);

  // État du formulaire
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  constructor(private router: Router) {}

  protected onAccountTypeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.accountType.set(target.value);
  }

  protected onFirstNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.firstName.set(target.value);
  }

  protected onLastNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.lastName.set(target.value);
  }

  protected onEmailChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
  }

  protected onPasswordChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.password.set(target.value);
  }

  protected onConfirmPasswordChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.confirmPassword.set(target.value);
  }

  protected onAcceptTermsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.acceptTerms.set(target.checked);
  }

  protected async onSubmit(): Promise<void> {
    if (this.isLoading()) return;

    // Validation de base
    if (!this.isFormValid()) {
      this.error.set('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const result = this.accountType() === 'developer'
        ? await this.registerExpert()
        : await this.registerRecruiter();

      if (result.success) {
        this.success.set(result.message);
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { message: 'verify-email' }
          });
        }, 3000);
      } else {
        this.error.set(result.message);
      }

    } catch (error) {
      this.error.set('Une erreur inattendue s\'est produite. Veuillez réessayer.');
      console.error('Erreur inscription:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Inscription expert
   */
  private async registerExpert() {
    return await this.auth.registerExpert({
      email: this.email(),
      password: this.password(),
      firstName: this.firstName(),
      lastName: this.lastName(),
      location: 'France', // Valeur par défaut
      city: 'Paris', // Valeur par défaut
      bio: 'Expert Angular passionné'
    });
  }

  /**
   * Inscription recruteur
   */
  private async registerRecruiter() {
    return await this.auth.registerRecruiter({
      email: this.email().trim(),
      password: this.password(),
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      company: 'Non renseigné',
      location: 'France'
    });
  }

  /**
   * Valider le formulaire
   */
  private isFormValid(): boolean {
    return this.firstName().trim().length >= 2 &&
           this.lastName().trim().length >= 2 &&
           this.isValidEmail(this.email().trim()) &&
           this.password().length >= 6 &&
           this.password() === this.confirmPassword() &&
           this.acceptTerms();
  }

  /**
   * Valider l'email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Vérifier si les mots de passe correspondent
   */
  protected passwordsMatch(): boolean {
    return this.password() === this.confirmPassword();
  }

  protected async onGoogleRegister(): Promise<void> {
    if (this.isLoading()) return;

    try {
      const accountTypeRole = this.accountType() === 'developer' ? 'expert' : 'recruiter';
      const result = await this.auth.signInWithGoogle(accountTypeRole);

      if (result.success) {
        this.success.set(result.message);

        if (result.isNewUser) {
          // Nouveau compte créé
          setTimeout(() => {
            if (accountTypeRole === 'expert') {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/recruiter/dashboard']);
            }
          }, 2000);
        } else {
          // Utilisateur existant connecté
          setTimeout(() => {
            if (accountTypeRole === 'expert') {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/recruiter/dashboard']);
            }
          }, 1000);
        }
      } else {
        this.error.set(result.message);
      }

    } catch (error) {
      this.error.set('Erreur lors de la connexion Google. Veuillez réessayer.');
      console.error('Erreur Google OAuth:', error);
    }
  }

  protected onGithubRegister(): void {
    // TODO: Implement GitHub OAuth registration
    console.log('GitHub register');
  }

  protected onLogin(): void {
    // Remonter en haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.router.navigate(['/login']);
  }
}
