import { Component, inject, input } from '@angular/core';
import { DxSelectBoxModule } from 'devextreme-angular';
import { ProductService } from '../../helpers/services/product.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar-product-select',
  template: `
    <dx-select-box
      [items]="(products$ | async) || []"
      placeholder="Select Product"
      valueExpr="id"
      [value]="currentProductId()"
      displayExpr="name"
      style="width: 200px;"
      (onValueChanged)="onProductSelected($event)"
    ></dx-select-box>
  `,
  styles: [``],
  imports: [DxSelectBoxModule, AsyncPipe],
})
export class NavbarProductSelectComponent {
  productService = inject(ProductService);
  products$ = this.productService.getProducts().pipe(takeUntilDestroyed());

  currentProductId = input.required<number>();
  router = inject(Router);

  onProductSelected(event: any) {
    const selectedProductId = event.value;
    //get current route and replace productId parameter
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);

    const newUrl = currentUrl.replace(/products\/\d+/, `products/${selectedProductId}`);
    this.router.navigateByUrl(newUrl);
    console.log('Selected product ID:', selectedProductId);
  }
}
