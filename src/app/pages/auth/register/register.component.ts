import { Component } from '@angular/core';
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

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [ReactiveFormsModule, DxTextBoxComponent, DxButtonComponent],
})
export class RegisterComponent {
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
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator }
  );

  onSubmit() {
    console.log('Kayıt formu değerleri', this.registerForm.value);
    console.log('Kayıt formu hataları', this.registerForm.errors);
    if (this.registerForm.valid) {
      const { email, password, confirmPassword } = this.registerForm.value;
      // Kayıt mantığını burada ele alın, örneğin bir kayıt servisi çağırın
      console.log('Kullanıcı şu bilgilerle kaydediliyor', email, password);
    } else {
      // Doğrulama mesajlarını göstermek için tüm alanları touched olarak işaretleyin
      this.registerForm.markAllAsTouched();
    }
  }
}
