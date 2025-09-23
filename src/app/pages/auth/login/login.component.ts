import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../helpers/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NgClass, RouterLink],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly isSubmitDisabled = computed(() => this.isSubmitting() || this.loginForm.invalid);

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService
      .login(email, password)
      .then(() => {
        this.router.navigate(['/admin/home']);
      })
      .catch((error) => {
        console.error('Giriş hatası:', error);
        this.errorMessage.set('Giriş başarısız. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
      })
      .finally(() => {
        this.isSubmitting.set(false);
      });
  }
}
