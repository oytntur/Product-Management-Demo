import { Component, inject } from '@angular/core';
import { AuthService } from '../../../helpers/services/auth.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  authService = inject(AuthService);

  login() {
    this.authService.login('turoytun0@gmail.com', '123456');
  }
}
