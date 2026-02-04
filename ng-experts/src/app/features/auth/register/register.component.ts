import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class Register {
  protected readonly accountType = signal('developer');
  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly acceptTerms = signal(false);

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

  protected onSubmit(): void {
    // TODO: Implement registration logic
    console.log('Register:', {
      accountType: this.accountType(),
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email(),
      password: this.password(),
      confirmPassword: this.confirmPassword(),
      acceptTerms: this.acceptTerms()
    });
  }

  protected onGoogleRegister(): void {
    // TODO: Implement Google OAuth registration
    console.log('Google register');
  }

  protected onGithubRegister(): void {
    // TODO: Implement GitHub OAuth registration
    console.log('GitHub register');
  }

  protected onLogin(): void {
    this.router.navigate(['/login']);
  }
}
