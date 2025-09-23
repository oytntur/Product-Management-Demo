import { Component } from '@angular/core';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  template: `
    <app-navbar></app-navbar>
    <main class="container my-4">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [``],
  imports: [NavbarComponent, FooterComponent, RouterOutlet],
})
export class AdminLayoutComponent {}
