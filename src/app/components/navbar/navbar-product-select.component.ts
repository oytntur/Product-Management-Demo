import { Component, computed, inject } from '@angular/core';
import { DxSelectBoxModule } from 'devextreme-angular';
import { ProductService } from '../../helpers/services/product.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar-product-select',
  template: `
    <div class="product-picker">
      <h3 class="product-picker__title">Ürün Detay /</h3>
      <dx-select-box
        class="product-picker__select"
        [items]="(products$ | async) || []"
        placeholder="Ürün seçin"
        valueExpr="id"
        [value]="currentProductId()"
        displayExpr="name"
        (onValueChanged)="onProductSelected($event)"
      ></dx-select-box>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .product-picker {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        color: #fff;
      }

      .product-picker__title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .product-picker__select {
        min-width: 220px;
        flex: 0 0 auto;
      }

      @media (max-width: 767px) {
        .product-picker__select {
          flex: 1 1 100%;
          min-width: 0;
          width: 100% !important;
        }
      }
    `,
  ],
  imports: [DxSelectBoxModule, AsyncPipe],
})
export class NavbarProductSelectComponent {
  private readonly productService = inject(ProductService);
  readonly products$ = this.productService.getProducts().pipe(takeUntilDestroyed());

  private readonly router = inject(Router);

  readonly currentProductId = computed(() => {
    const url = this.router.url;
    const match = url.match(/products\/(\d+)/);
    return match ? Number(match[1]) : null;
  });

  onProductSelected(event: any) {
    const selectedProductId = event.value;
    const currentUrl = this.router.url;
    const newUrl = currentUrl.replace(/products\/\d+/, `products/${selectedProductId}`);
    this.router.navigateByUrl(newUrl);
  }
}
