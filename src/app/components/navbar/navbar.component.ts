import { JsonPipe, NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarProductSelectComponent } from './navbar-product-select.component';
import { NavbarHeaderTextComponent } from './navbar-header-text.component';

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
