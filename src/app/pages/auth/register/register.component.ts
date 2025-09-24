import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DxButtonComponent } from 'devextreme-angular/ui/button';
import { DxTextBoxComponent } from 'devextreme-angular/ui/text-box';
import { AuthService } from '../../../helpers/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [ReactiveFormsModule, DxTextBoxComponent, DxButtonComponent],
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // TODO:bunu ayrı bir dosyaya taşı
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  };

  registerForm = new FormGroup(
    {
      fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator }
  );

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  onSubmit() {
    if (this.registerForm.valid) {
      const { email, password, fullName } = this.registerForm.value;
      if (!email || !password) {
        return;
      }

      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      this.authService
        .register(email, password, fullName ?? undefined)
        .then(() => {
          this.successMessage.set('Kayıt işlemi tamamlandı. Giriş sayfasına yönlendiriliyorsunuz.');
          setTimeout(() => this.router.navigate(['/auth/login']), 1500);
        })
        .catch((error) => {
          console.error('Kayıt işlemi başarısız', error);
          this.errorMessage.set('Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
        })
        .finally(() => {
          this.isSubmitting.set(false);
        });
    } else {
      // Doğrulama mesajlarını göstermek için tüm alanları touched olarak işaretleyin
      this.registerForm.markAllAsTouched();
    }
  }
}
