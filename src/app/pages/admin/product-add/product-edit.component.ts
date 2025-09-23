import { Component, inject, input, signal } from '@angular/core';
import { ProductService } from '../../../helpers/services/product.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Product } from '../../../helpers/models/product.model';
import { filter, switchMap } from 'rxjs';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-admin-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
  imports: [JsonPipe],
})
export class ProductEditComponent {
  //check if route param id exists and fetch product details by id

  productService = inject(ProductService);
  productId = input<number | undefined>();
  productId$ = toObservable(this.productId);
  product = signal<Product | null>(null);

  constructor() {
    this.productId$
      .pipe(
        takeUntilDestroyed(),
        filter((id): id is number => id !== undefined),
        switchMap((id) => this.productService.getProductById(id))
      )
      .subscribe((product) => {
        console.log('get product', product);
        this.product.set(product);
      });
  }
}
