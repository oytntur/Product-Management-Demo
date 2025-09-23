import { JsonPipe, NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarProductSelectComponent } from './navbar-product-select.component';
import { NavbarHeaderTextComponent } from './navbar-header-text.component';
import { AuthService } from '../../helpers/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [NgComponentOutlet],
})
export class NavbarComponent {
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  productId = signal<number | null>(null);

  authService = inject(AuthService);

  currentUser = this.authService.authedUser;

  constructor() {}

  getPageHeaderComponent() {
    const route = this.activatedRoute.snapshot;
    const router = this.router;
    if (router.url.startsWith('/admin/products/')) {
      return NavbarProductSelectComponent;
    }
    return NavbarHeaderTextComponent;
  }
}
