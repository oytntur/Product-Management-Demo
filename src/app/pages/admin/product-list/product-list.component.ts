import { Component, inject } from '@angular/core';
import { DxButtonComponent, DxDataGridModule } from 'devextreme-angular';
import { ProductService } from '../../../helpers/services/product.service';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { RowUpdatedEvent } from 'devextreme/ui/data_grid';

@Component({
  selector: 'app-admin-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [DxDataGridModule, AsyncPipe, DxButtonComponent],
})
export class ProductListComponent {
  productsService = inject(ProductService);
  products = this.productsService.getProducts();

  goToDetail(event: any) {
    console.log(event.row.data);
  }

  addNewProduct() {
    console.log('Add new product clicked');
  }

  updateProduct(event: RowUpdatedEvent) {
    console.log('Updated product:', event.data);
    this.productsService.updateProduct(event.data).subscribe({
      next: (updatedProduct) => {
        console.log('Product updated successfully:', updatedProduct);
      },
      error: (err) => {
        console.error('Error updating product:', err);
      },
    });
  }
}
