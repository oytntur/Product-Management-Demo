import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxLoadIndicatorModule } from 'devextreme-angular';

@Component({
  selector: 'app-loading-card',
  standalone: true,
  imports: [CommonModule, DxLoadIndicatorModule],
  templateUrl: './loading-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingCardComponent {
  heading = input<string>('Bilgiler yükleniyor');

  description = input<string>('Lütfen bekleyin, içerik hazırlanıyor.');

  indicatorSize = input<number>(45);

  showIndicator = input<boolean>(true);
}
