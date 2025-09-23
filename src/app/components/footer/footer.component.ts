import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: ` <footer class="footer">
    <div class="container">
      <span class="text-muted">Sabah Yıldızı Admin Panel © 2024</span>
    </div>
  </footer>`,
  styles: [
    `
      .footer {
        background-color: #f8f9fa;
        padding: 1rem 0;
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
      }
    `,
  ],
})
export class FooterComponent {}
