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
  // Custom validator for password confirmation
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
    console.log(this.registerForm.value);
    console.log(this.registerForm.errors);
    if (this.registerForm.valid) {
      const { email, password, confirmPassword } = this.registerForm.value;
      // Handle registration logic here, e.g., call a registration service
      console.log('Registering user with', email, password);
    } else {
      // Mark all fields as touched to trigger validation messages
      this.registerForm.markAllAsTouched();
    }
  }
}
