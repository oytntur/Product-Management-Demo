import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DxButtonComponent } from 'devextreme-angular/ui/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DxButtonComponent, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('sabahyildizi-interview-1');
}
