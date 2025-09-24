import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../helpers/services/product.service';
import { catchError, finalize, of, switchMap, shareReplay, firstValueFrom, startWith } from 'rxjs';
import { DxButtonModule, DxProgressBarModule, DxDataGridModule } from 'devextreme-angular';
import { Product } from '../../../helpers/models/product.model';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { LoadingCardComponent } from '../../../components/loading-card/loading-card.component';
import { CustomStore } from 'devextreme/common/data';
import { Order } from '../../../helpers/models/order.model';
import { OrderService } from '../../../helpers/services/order.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  imports: [
    DxButtonModule,
    DxProgressBarModule,
    DxDataGridModule,
    DecimalPipe,
    CurrencyPipe,
    LoadingCardComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent {
  productId = input<number | undefined>(undefined);
  private productId$ = toObservable(this.productId);

  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);

  // loading state as a signal
  isLoading = signal(false);

  productOrdersCustomDataSource: CustomStore;

  // Stream: fetch product when id exists, cache last value with shareReplay
  private product$ = this.productId$.pipe(
    takeUntilDestroyed(),
    switchMap((id) => {
      if (id == null) {
        this.isLoading.set(false);
        return of(null as Product | null);
      }

      this.isLoading.set(true);
      return this.productService.getProductById(id).pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null)),
        finalize(() => this.isLoading.set(false)),
        startWith(null) // emit a null placeholder so the UI shows loading state
      );
    }),
    // cache the latest successfully fetched product for new subscribers
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Expose as a signal for template usage
  product = toSignal<Product | null>(this.product$, { initialValue: null });

  constructor() {
    this.productOrdersCustomDataSource = new CustomStore({
      key: 'id',
      load: () => {
        const ordersRequest = this.productId$.pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap((id) => {
            if (!id) {
              return of([] as Order[]);
            }
            return this.orderService
              .getOrdersByProductId(id)
              .pipe(takeUntilDestroyed(this.destroyRef));
          })
        );
        return firstValueFrom(ordersRequest);
      },
    });
  }
}
