import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class Login {
  private auth = inject(Auth);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly rememberMe = signal(false);

  // États du formulaire
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  constructor(private router: Router) {}

  protected onEmailChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
  }

  protected onPasswordChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.password.set(target.value);
  }

  protected onRememberMeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.rememberMe.set(target.checked);
  }

  protected async onSubmit(): Promise<void> {
    if (this.isLoading()) return;

    // Validation de base
    if (!this.isFormValid()) {
      this.error.set('Veuillez remplir tous les champs requis');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const result = await this.auth.login(this.email(), this.password());

      if (result.success) {
        this.success.set('Connexion réussie ! Redirection...');

        // Attendre que currentUser soit chargé puis rediriger
        let attempts = 0;
        const waitAndRedirect = () => {
          const user = this.auth.getCurrentUser()();
          if (user) {
            if (user.role === 'recruiter') {
              this.router.navigate(['/recruiter/dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else if (attempts < 20) {
            // Réessayer jusqu'à 20 fois (max 2 secondes)
            attempts++;
            setTimeout(waitAndRedirect, 100);
          } else {
            // Fallback après 2 secondes
            this.router.navigate(['/dashboard']);
          }
        };
        setTimeout(waitAndRedirect, 200);
      } else {
        this.error.set(result.message);
      }

    } catch (error) {
      this.error.set('Une erreur inattendue s\'est produite. Veuillez réessayer.');
      console.error('Erreur connexion:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Valider le formulaire
   */
  private isFormValid(): boolean {
    return this.email().trim().length > 0 &&
           this.password().length > 0 &&
           this.isValidEmail(this.email());
  }

  /**
   * Valider l'email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected async onGoogleLogin(): Promise<void> {
    if (this.isLoading()) return;

    try {
      // On utilise 'expert' par défaut pour le login,
      // l'utilisateur existe déjà donc le type sera détecté automatiquement
      const result = await this.auth.signInWithGoogle('expert');

      if (result.success) {
        this.success.set(result.message);
        setTimeout(() => {
          const user = this.auth.getCurrentUser()();
          if (user?.role === 'expert') {
            this.router.navigate(['/dashboard']);
          } else if (user?.role === 'recruiter') {
            this.router.navigate(['/recruiter/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 1000);
      } else {
        this.error.set(result.message);
      }
    } catch (error) {
      this.error.set('Erreur lors de la connexion Google. Veuillez réessayer.');
      console.error('Erreur Google OAuth:', error);
    }
  }

  protected onGithubLogin(): void {
    // TODO: Implement GitHub OAuth
    console.log('GitHub login');
  }

  protected onForgotPassword(): void {
    // TODO: Navigate to forgot password page
    console.log('Forgot password');
  }

  protected onRegister(): void {
    // Remonter en haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.router.navigate(['/register']);
  }
}
