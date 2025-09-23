import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar-header-text',
  template: '<h1>{{ activatedRoute.snapshot.title }}</h1>',
})
export class NavbarHeaderTextComponent {
  activatedRoute = inject(ActivatedRoute);
}
