import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxButtonComponent } from 'devextreme-angular/ui/button';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, DxTextBoxModule, DxButtonComponent],
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onSubmit() {
    console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      // Handle login logic here, e.g., call an authentication service
      console.log('Login attempt with', email, password);
    } else {
      // Mark all fields as touched to trigger validation messages
      this.loginForm.markAllAsTouched();
    }
  }
}
