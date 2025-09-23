import { Component, inject } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import { ProductService } from '../../../helpers/services/product.service';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-admin-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [DxDataGridModule, AsyncPipe],
})
export class ProductListComponent {
  productsService = inject(ProductService);
  products = this.productsService.getProducts();

  goToDetail(event: any) {
    console.log(event.row.data);
  }
}
