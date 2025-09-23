import { Component, inject, signal } from '@angular/core';
import { DxButtonComponent, DxDataGridModule } from 'devextreme-angular';
import { ProductService } from '../../../helpers/services/product.service';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { RowRemovedEvent, RowUpdatedEvent } from 'devextreme/ui/data_grid';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [DxDataGridModule, AsyncPipe, DxButtonComponent, RouterLink],
})
export class ProductListComponent {
  productsService = inject(ProductService);
  router = inject(Router);
  products = this.productsService.getProducts();
  editingGrid = signal(false);

  goToDetail = (event: any) => {
    const productId = event?.row?.data?.id;
    if (!productId) {
      return;
    }

    this.router.navigate(['/admin/products', productId]);
  };

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

  deleteProduct(event: RowRemovedEvent) {
    console.log('Deleted product:', event.data);
    this.productsService.deleteProduct(event.data.id).subscribe({
      next: () => {
        console.log('Product deleted successfully');
      },
      error: (err) => {
        console.error('Error deleting product:', err);
      },
    });
  }

  startEditing() {
    this.editingGrid.set(true);
  }

  stopEditing() {
    console.log('Stopping editing mode');
    this.editingGrid.set(false);
  }
}
