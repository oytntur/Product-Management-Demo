import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, take } from 'rxjs';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';

import { ProductService } from '../../../helpers/services/product.service';
import { Product } from '../../../helpers/models/product.model';
import { OrderService } from '../../../helpers/services/order.service';

type OrderDetailForm = {
  productId: number | null;
  unitPrice: number;
  quantity: number;
  discount: number;
};

type ShipAddressForm = {
  street: string;
  city: string;
  region: string;
  postalCode: number | null;
  country: string;
};

type OrderForm = {
  id: number | null;
  customerId: string;
  employeeId: number | null;
  orderDate: string | null;
  requiredDate: string | null;
  shippedDate: string | null;
  shipVia: number | null;
  freight: number;
  shipName: string;
  shipAddress: ShipAddressForm;
  details: OrderDetailForm[];
};

@Component({
  selector: 'app-admin-product-edit',
  standalone: true,
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
  imports: [
    ReactiveFormsModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditComponent {
  // Route param veya parent’tan gelecek id
  productId = input<number | undefined>();
  private productId$ = toObservable(this.productId);

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private orderService = inject(OrderService);

  product = signal<Product | null>(null);
  isEdit = computed(() => !!this.productId());

  // Ana form (Product + birden fazla Order opsiyonel)
  form = this.fb.group({
    product: this.fb.group({
      id: [null as number | null],
      supplierId: [null as number | null],
      categoryId: [null as number | null],
      quantityPerUnit: ['', [Validators.required, Validators.maxLength(100)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      unitsInStock: [0, [Validators.min(0)]],
      unitsOnOrder: [0, [Validators.min(0)]],
      reorderLevel: [0, [Validators.min(0)]],
      discontinued: [false],
      name: ['', [Validators.required, Validators.maxLength(120)]],
    }),
    orders: this.fb.array([] as FormGroup[]), // opsiyonel; dilediğinde devreye al
  });

  constructor() {
    // edit modunda ürünü çek
    this.productId$
      .pipe(
        takeUntilDestroyed(),
        filter((id): id is number => id !== undefined),
        switchMap((id) => this.productService.getProductById(id))
      )
      .subscribe((prod) => {
        this.product.set(prod);
        this.form.get('product')?.patchValue({
          id: prod.id ?? null,
          supplierId: prod.supplierId ?? null,
          categoryId: prod.categoryId ?? null,
          quantityPerUnit: prod.quantityPerUnit ?? '',
          unitPrice: prod.unitPrice ?? 0,
          unitsInStock: prod.unitsInStock ?? 0,
          unitsOnOrder: prod.unitsOnOrder ?? 0,
          reorderLevel: prod.reorderLevel ?? 0,
          discontinued: prod.discontinued ?? false,
          name: prod.name ?? '',
        });
      });

    this.productId$
      .pipe(
        takeUntilDestroyed(),
        filter((id): id is number => id !== undefined),
        switchMap((id) => this.orderService.getOrdersByProductId(id))
      )
      .subscribe((orders) => {
        this.clearOrders();
        orders.forEach((order) => this.pushOrder(order));
      });
  }

  /** --- Orders helpers --- **/
  get ordersFA(): FormArray<FormGroup> {
    return this.form.get('orders') as FormArray<FormGroup>;
  }

  private createOrderGroup(seed?: Partial<OrderForm>): FormGroup {
    return this.fb.group({
      id: [seed?.id ?? null],
      customerId: [seed?.customerId ?? ''],
      employeeId: [seed?.employeeId ?? null],
      orderDate: [seed?.orderDate ?? null],
      requiredDate: [seed?.requiredDate ?? null],
      shippedDate: [seed?.shippedDate ?? null],
      shipVia: [seed?.shipVia ?? null],
      freight: [seed?.freight ?? 0, [Validators.min(0)]],
      shipName: [seed?.shipName ?? ''],
      shipAddress: this.fb.group({
        street: [seed?.shipAddress?.street ?? ''],
        city: [seed?.shipAddress?.city ?? ''],
        region: [seed?.shipAddress?.region ?? ''],
        postalCode: [seed?.shipAddress?.postalCode ?? null],
        country: [seed?.shipAddress?.country ?? ''],
      }),
      details: this.fb.array((seed?.details ?? []).map((d) => this.createDetailGroup(d))),
    });
  }

  private createDetailGroup(seed?: Partial<OrderDetailForm>): FormGroup {
    return this.fb.group({
      productId: [
        seed?.productId ?? this.form.get('product.id')?.value ?? null,
        Validators.required,
      ],
      unitPrice: [
        seed?.unitPrice ?? this.form.get('product.unitPrice')?.value ?? 0,
        [Validators.required, Validators.min(0)],
      ],
      quantity: [seed?.quantity ?? 1, [Validators.required, Validators.min(1)]],
      discount: [seed?.discount ?? 0, [Validators.min(0), Validators.max(1)]],
    });
  }

  addOrder(seed?: Partial<OrderForm>) {
    this.ordersFA.push(this.createOrderGroup(seed));
  }

  removeOrder(index: number) {
    this.ordersFA.removeAt(index);
  }

  getDetailsFA(orderIndex: number): FormArray<FormGroup> {
    return this.ordersFA.at(orderIndex).get('details') as FormArray<FormGroup>;
  }

  addDetail(orderIndex: number, seed?: Partial<OrderDetailForm>) {
    this.getDetailsFA(orderIndex).push(this.createDetailGroup(seed));
  }

  removeDetail(orderIndex: number, detailIndex: number) {
    this.getDetailsFA(orderIndex).removeAt(detailIndex);
  }

  private clearOrders() {
    while (this.ordersFA.length) this.ordersFA.removeAt(0);
  }

  private pushOrder(seed: Partial<OrderForm>) {
    this.ordersFA.push(this.createOrderGroup(seed));
  }

  /** --- Submit --- **/
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    // Product payload
    const productPayload: Product = {
      id: value.product?.id ?? 0,
      supplierId: value.product?.supplierId ?? 0,
      categoryId: value.product?.categoryId ?? 0,
      quantityPerUnit: value.product?.quantityPerUnit ?? '',
      unitPrice: value.product?.unitPrice ?? 0,
      unitsInStock: value.product?.unitsInStock ?? 0,
      unitsOnOrder: value.product?.unitsOnOrder ?? 0,
      reorderLevel: value.product?.reorderLevel ?? 0,
      discontinued: value.product?.discontinued ?? false,
      name: value.product?.name ?? '',
    };

    // Orders payload (OrderService ile kullanırsın)
    const ordersPayload = (value.orders ?? []).map((o) => ({
      id: o?.id ?? null,
      customerId: o?.customerId ?? '',
      employeeId: o?.employeeId ?? null,
      orderDate: o?.orderDate ?? '',
      requiredDate: o?.requiredDate ?? '',
      shippedDate: o?.shippedDate ?? '',
      shipVia: o?.shipVia ?? null,
      freight: o?.freight ?? 0,
      shipName: o?.shipName ?? '',
      shipAddress: {
        street: o?.shipAddress?.street ?? '',
        city: o?.shipAddress?.city ?? '',
        region: o?.shipAddress?.region ?? '',
        postalCode: o?.shipAddress?.postalCode ?? null,
        country: o?.shipAddress?.country ?? '',
      },
      details: (o?.details ?? []).map((d: any) => ({
        productId: d?.productId ?? null,
        unitPrice: d?.unitPrice ?? 0,
        quantity: d?.quantity ?? 1,
        discount: d?.discount ?? 0,
      })),
    }));

    if (this.isEdit()) {
      // UPDATE
      console.log('Update product', this.form.value);

      this.productService.updateProduct(productPayload).subscribe((updatedProduct) => {
        console.log('Product updated:', updatedProduct);
      });
    } else {
      // CREATE
      console.log('Create product', this.form.value);
    }
  }
}
