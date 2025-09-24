import { Component, inject, signal, viewChild } from '@angular/core';
import { DxButtonComponent, DxContextMenuModule, DxDataGridModule } from 'devextreme-angular';
import { ProductService } from '../../../helpers/services/product.service';
import { AsyncPipe, JsonPipe, NgClass } from '@angular/common';
import { RowRemovedEvent, RowUpdatedEvent } from 'devextreme/ui/data_grid';
import { Router, RouterLink } from '@angular/router';
import { DxContextMenuComponent, DxContextMenuTypes } from 'devextreme-angular/ui/context-menu';

@Component({
  selector: 'app-admin-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [
    DxDataGridModule,
    AsyncPipe,
    DxButtonComponent,
    DxContextMenuModule,
    NgClass,
    DxButtonComponent,
  ],
})
export class ProductListComponent {
  productsService = inject(ProductService);
  router = inject(Router);
  products = this.productsService.getProducts();
  editingGrid = signal(false);

  contextMenuItems = [
    { text: 'Zoom In' },
    { text: 'Zoom Out' },
    {
      text: 'Share',
      items: [
        {
          text: 'Send to a friend',
          items: [{ text: 'Log in with Facebook' }, { text: 'Log in with Twitter' }],
        },
        {
          text: 'Send to a group',
          items: [{ text: 'Log in with Facebook' }, { text: 'Log in with Twitter' }],
        },
      ],
    },
    { text: 'Comment' },
  ];

  itemClick(e: any) {
    console.log('Item clicked:', e);
  }

  goToDetail = (event: any) => {
    const productId = event?.row?.data?.id;
    if (!productId) {
      return;
    }

    this.router.navigate(['/admin/products', productId]);
  };

  addNewProduct() {
    console.log('Yeni ürün ekleme tıklandı');
  }

  updateProduct(event: RowUpdatedEvent) {
    console.log('Güncellenen ürün:', event.data);
    this.productsService.updateProduct(event.data).subscribe({
      next: (updatedProduct) => {
        console.log('Ürün başarıyla güncellendi:', updatedProduct);
      },
      error: (err) => {
        console.error('Ürün güncellenirken hata oluştu:', err);
      },
    });
  }

  deleteProduct(event: RowRemovedEvent) {
    console.log('Silinen ürün:', event.data);
    this.productsService.deleteProduct(event.data.id).subscribe({
      next: () => {
        console.log('Ürün başarıyla silindi');
      },
      error: (err) => {
        console.error('Ürün silinirken hata oluştu:', err);
      },
    });
  }

  startEditing() {
    this.editingGrid.set(true);
  }

  stopEditing() {
    console.log('Düzenleme modu kapatılıyor');
    this.editingGrid.set(false);
  }
}
