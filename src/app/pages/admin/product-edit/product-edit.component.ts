import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { combineLatest, finalize, Observable, take } from 'rxjs';

import { ProductService, ProductCreatePayload, ProductUpdatePayload } from '../../../helpers/services/product.service';
import { Product } from '../../../helpers/models/product.model';
import { Order } from '../../../helpers/models/order.model';
import { OrderService } from '../../../helpers/services/order.service';

const DEFAULT_UNIT = 'pcs';

@Component({
  selector: 'app-admin-product-edit',
  standalone: true,
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,
    DatePipe,
    DecimalPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditComponent {
  productId = input<number | undefined>();
  private readonly productId$ = toObservable(this.productId);

  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly product = signal<Product | null>(null);
  readonly orders = signal<Order[]>([]);

  private readonly defaultFormValue = {
    name: '',
    unitPrice: 0,
    unitsInStock: 0,
    unit: DEFAULT_UNIT,
    discontinued: false,
  } as const;

  readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    unitsInStock: [0, [Validators.required, Validators.min(0)]],
    unit: [DEFAULT_UNIT, [Validators.required, Validators.maxLength(12)]],
    discontinued: [false],
  });

  readonly isCreateMode = computed(() => this.productId() === undefined);
  readonly canSubmit = computed(() => this.productForm.valid && !this.isSubmitting());
  readonly submitLabel = computed(() => (this.isCreateMode() ? 'Ürünü Oluştur' : 'Güncellemeyi Kaydet'));
  readonly pageTitle = computed(() => (this.isCreateMode() ? 'Yeni Ürün Oluştur' : 'Ürünü Düzenle'));
  readonly pageSubtitle = computed(() =>
    this.isCreateMode()
      ? 'Mağazanıza yeni bir ürün ekleyin ve stok bilgilerini tanımlayın.'
      : 'Ürünün temel bilgilerini güncelleyin ve bağlı siparişleri görüntüleyin.'
  );
  readonly unitOptions = ['pcs', 'box', 'kg', 'set', 'pack'];
  readonly hasOrders = computed(() => !this.isCreateMode() && this.orders().length > 0);

  constructor() {
    this.productId$
      .pipe(takeUntilDestroyed())
      .subscribe((rawProductId) => {
        this.handleProductIdChange(rawProductId);
      });
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue();
    const payload: ProductCreatePayload = {
      name: formValue.name.trim(),
      unitPrice: formValue.unitPrice,
      unitsInStock: formValue.unitsInStock,
      unit: formValue.unit.trim() || DEFAULT_UNIT,
      discontinued: formValue.discontinued,
    };

    const isCreate = this.isCreateMode();

    let request$: Observable<Product>;
    if (isCreate) {
      request$ = this.productService.createProduct(payload);
    } else {
      const productId = this.ensureProductId();
      if (!Number.isInteger(productId)) {
        this.errorMessage.set('Geçersiz ürün kimliği. Lütfen tekrar deneyiniz.');
        return;
      }
      request$ = this.productService.updateProduct(productId, payload as ProductUpdatePayload);
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    request$
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (product) => {
          if (isCreate) {
            this.successMessage.set('Ürün oluşturuldu. Düzenleme sayfasına yönlendiriliyorsunuz.');
            this.router.navigate(['/admin/products', product.id, 'edit']);
          } else {
            this.successMessage.set('Ürün başarıyla güncellendi.');
            this.product.set(product);
            this.orders.set(product.orders ?? this.orders());
            this.resetForm(product);
          }
        },
        error: (error) => {
          console.error('Ürün kaydedilemedi', error);
          this.errorMessage.set('Ürün kaydedilemedi. Lütfen tekrar deneyiniz.');
        },
      });
  }

  restoreForm(): void {
    this.resetForm(this.product());
  }

  navigateBack(): void {
    this.router.navigate(['/admin/products']);
  }

  private handleProductIdChange(rawId: number | string | undefined): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (rawId === undefined || rawId === null) {
      this.product.set(null);
      this.orders.set([]);
      this.resetForm(null);
      this.isLoading.set(false);
      return;
    }

    const numericId = typeof rawId === 'string' ? Number.parseInt(rawId, 10) : rawId;
    if (!Number.isInteger(numericId)) {
      this.product.set(null);
      this.orders.set([]);
      this.resetForm(null);
      this.isLoading.set(false);
      this.errorMessage.set('Geçersiz ürün kimliği.');
      return;
    }

    this.isLoading.set(true);

    combineLatest([
      this.productService.getProductById(numericId),
      this.orderService.getOrdersByProductId(numericId),
    ])
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed()
      )
      .subscribe({
        next: ([product, orders]) => {
          this.product.set(product);
          this.orders.set(orders);
          this.resetForm(product);
        },
        error: (error) => {
          console.error('Ürün bilgisi alınamadı', error);
          this.errorMessage.set('Ürün bilgisi alınamadı. Lütfen tekrar deneyiniz.');
          this.product.set(null);
          this.orders.set([]);
          this.resetForm(null);
        },
      });
  }

  private resetForm(product: Product | null): void {
    const value = {
      name: product?.name ?? this.defaultFormValue.name,
      unitPrice: product?.unitPrice ?? this.defaultFormValue.unitPrice,
      unitsInStock: product?.unitsInStock ?? this.defaultFormValue.unitsInStock,
      unit: product?.unit ?? this.defaultFormValue.unit,
      discontinued: product?.discontinued ?? this.defaultFormValue.discontinued,
    };

    this.productForm.reset(value);
  }

  private ensureProductId(): number {
    const rawId = this.productId();
    const numericId = typeof rawId === 'string' ? Number.parseInt(rawId, 10) : rawId;
    if (numericId === undefined || numericId === null) {
      return Number.NaN;
    }
    return numericId;
  }
}
