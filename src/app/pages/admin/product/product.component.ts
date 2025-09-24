import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../helpers/services/product.service';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { DxButtonModule, DxProgressBarModule, DxLoadIndicatorModule } from 'devextreme-angular';
import { Product } from '../../../helpers/models/product.model';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  imports: [DxButtonModule, DxProgressBarModule, DxLoadIndicatorModule, DatePipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent {
  productId = input<number | undefined>(undefined);
  productId$ = toObservable(this.productId);

  productService = inject(ProductService);
  isLoading = signal(false);

  product = signal<Product | null>(null);
  htmlMath = Math;

  constructor() {
    this.productId$
      .pipe(
        takeUntilDestroyed(),
        tap(() => {
          this.isLoading.set(true);
          this.product.set(null);
        }),
        switchMap((id) => {
          if (id) {
            return this.productService.getProductById(id);
          }

          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((product) => this.product.set(product));
  }
}
