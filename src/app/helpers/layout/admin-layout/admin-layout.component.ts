import { Component } from '@angular/core';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  template: `
    <app-navbar></app-navbar>
    <div class="wrapper">
      <router-outlet></router-outlet>
      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        padding: 0;
        margin: 0;
        width: 100%;
        align-items: stretch;
      }
      .wrapper {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }
    `,
  ],
  imports: [NavbarComponent, FooterComponent, RouterOutlet],
})
export class AdminLayoutComponent {}
