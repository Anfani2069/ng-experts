import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class Login {
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly rememberMe = signal(false);

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

  protected onSubmit(): void {
    // TODO: Implement login logic
    console.log('Login:', {
      email: this.email(),
      password: this.password(),
      rememberMe: this.rememberMe()
    });
  }

  protected onGoogleLogin(): void {
    // TODO: Implement Google OAuth
    console.log('Google login');
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
    // TODO: Navigate to register page
    this.router.navigate(['/register']);
  }
}
