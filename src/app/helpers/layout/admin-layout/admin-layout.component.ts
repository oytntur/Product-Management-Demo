import { Component } from '@angular/core';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  template: `
    <app-navbar></app-navbar>
    <main class="layout-main">
      <div class="container layout-main__content">
        <router-outlet></router-outlet>
      </div>
    </main>
    <app-footer></app-footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        width: 100%;
        padding: 0;
        margin: 0;
        align-items: stretch;
      }

      .layout-main {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 1.5rem 0 3rem;
      }

      .layout-main__content {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        min-height: 0;
        width: 100%;
      }
    `,
  ],
  imports: [NavbarComponent, FooterComponent, RouterOutlet],
})
export class AdminLayoutComponent {}
