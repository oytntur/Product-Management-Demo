import { Component, computed, inject, input } from '@angular/core';
import { DxSelectBoxModule } from 'devextreme-angular';
import { ProductService } from '../../helpers/services/product.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar-product-select',
  template: `
    <div class="d-flex align-items-center gap-2">
      <h3 class="m-0">Ürün Detay /</h3>
      <dx-select-box
        [items]="(products$ | async) || []"
        placeholder="Select Product"
        valueExpr="id"
        [value]="currentProductId()"
        displayExpr="name"
        style="width: 300px;"
        (onValueChanged)="onProductSelected($event)"
      ></dx-select-box>
    </div>
  `,
  styles: [],
  imports: [DxSelectBoxModule, AsyncPipe],
})
export class NavbarProductSelectComponent {
  productService = inject(ProductService);
  products$ = this.productService.getProducts().pipe(takeUntilDestroyed());

  router = inject(Router);

  currentProductId = computed(() => {
    //get productId from current url
    const url = this.router.url;
    const match = url.match(/products\/(\d+)/);
    return match ? Number(match[1]) : null;
  });

  onProductSelected(event: any) {
    const selectedProductId = event.value;
    //get current route and replace productId parameter
    const currentUrl = this.router.url;

    const newUrl = currentUrl.replace(/products\/\d+/, `products/${selectedProductId}`);
    this.router.navigateByUrl(newUrl);
  }
}
