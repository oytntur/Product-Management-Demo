import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  DxButtonComponent,
  DxButtonModule,
  DxContextMenuModule,
  DxDataGridModule,
} from 'devextreme-angular';
import {
  ProductCreatePayload,
  ProductService,
  ProductUpdatePayload,
} from '../../../helpers/services/product.service';
import { AsyncPipe } from '@angular/common';
import { RowRemovedEvent, RowUpdatingEvent } from 'devextreme/ui/data_grid';
import { Router, RouterLink } from '@angular/router';
import { DxContextMenuComponent, DxContextMenuTypes } from 'devextreme-angular/ui/context-menu';
import { CustomStore, DataSource } from 'devextreme/common/data';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom } from 'rxjs';
import { Product } from '../../../helpers/models/product.model';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  imports: [DxDataGridModule, DxContextMenuModule, DxButtonModule, RouterLink],
})
export class ProductListComponent {
  private productsService = inject(ProductService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  products$ = this.productsService.getProducts();
  editingGrid = signal(false);

  dataGridDataSource = new CustomStore({
    key: 'id',
    load: () => {
      const products = firstValueFrom(
        this.productsService.getProducts().pipe(takeUntilDestroyed(this.destroyRef))
      );
      return products;
    },
    update: (key, values) => {
      const productId = +key;
      if (!Number.isInteger(productId)) {
        return Promise.reject('Geçersiz ürün kimliği');
      }

      const updates: ProductUpdatePayload = {};
      const candidate = values;

      if (candidate.name !== undefined) {
        updates.name = candidate.name;
      }
      if (candidate.unitsInStock !== undefined) {
        updates.unitsInStock = candidate.unitsInStock;
      }
      if (candidate.unitPrice !== undefined) {
        updates.unitPrice = candidate.unitPrice;
      }
      if (candidate.unit !== undefined) {
        updates.unit = candidate.unit;
      }
      if (candidate.discontinued !== undefined) {
        updates.discontinued = candidate.discontinued;
      }

      const update$ = this.productsService
        .updateProduct(productId, updates)
        .pipe(takeUntilDestroyed(this.destroyRef));
      return firstValueFrom(update$);
    },
    remove: (key) => {
      const productId = +key;
      if (!Number.isInteger(productId)) {
        return Promise.reject('Geçersiz ürün kimliği');
      }

      const delete$ = this.productsService
        .deleteProduct(productId)
        .pipe(takeUntilDestroyed(this.destroyRef));
      return firstValueFrom(delete$).then(() => undefined);
    },
    insert: (values) => {
      const payload: ProductCreatePayload = {
        name: '',
      };
      const candidate = values;

      if (candidate.name !== undefined) {
        payload.name = candidate.name;
      }
      if (candidate.unitsInStock !== undefined) {
        payload.unitsInStock = candidate.unitsInStock;
      }
      if (candidate.unitPrice !== undefined) {
        payload.unitPrice = candidate.unitPrice;
      }
      if (candidate.unit !== undefined) {
        payload.unit = candidate.unit;
      }
      if (candidate.discontinued !== undefined) {
        payload.discontinued = candidate.discontinued;
      }

      const create$ = this.productsService
        .createProduct(payload)
        .pipe(takeUntilDestroyed(this.destroyRef));
      return firstValueFrom(create$);
    },
  });

  constructor() {}

  goToDetail = (event: any) => {
    const productId = event?.row?.data?.id;
    if (!productId) {
      return;
    }

    this.router.navigate(['/admin/products', productId]);
  };

  addNewProduct() {
    this.router.navigate(['/admin/products/undefined/edit']);
  }

  updateProduct(event: RowUpdatingEvent) {
    const productId = +event.key.id;
    if (!Number.isInteger(productId)) {
      console.warn('Geçersiz ürün kimliği, güncelleme atlandı:', event);
      return;
    }

    const updates: ProductUpdatePayload = {};

    const candidate = event.newData as ProductUpdatePayload & Record<string, unknown>;

    if (candidate.name !== undefined) {
      updates.name = candidate.name;
    }
    if (candidate.unitsInStock !== undefined) {
      updates.unitsInStock = candidate.unitsInStock;
    }
    if (candidate.unitPrice !== undefined) {
      updates.unitPrice = candidate.unitPrice;
    }
    if (candidate.unit !== undefined) {
      updates.unit = candidate.unit;
    }
    if (candidate.discontinued !== undefined) {
      updates.discontinued = candidate.discontinued;
    }

    this.productsService
      .updateProduct(productId, updates)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Ürün güncellenirken hata oluştu:', err);
        },
      });
  }

  deleteProduct(event: RowRemovedEvent) {
    this.productsService.deleteProduct(event.data.id).subscribe({
      next: () => {},
      error: (err) => {
        console.error('Ürün silinirken hata oluştu:', err);
      },
    });
  }

  startEditing() {
    this.editingGrid.set(true);
  }

  stopEditing() {
    this.editingGrid.set(false);
  }
}
