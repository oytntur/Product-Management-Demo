import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ProductOrderPayload,
  ProductSavePayload,
  ProductService,
} from '../../../helpers/services/product.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { Router } from '@angular/router';

type OrderForm = FormGroup<{
  id: FormControl<number>; // no nulls
  customerName: FormControl<string>;
  orderDate: FormControl<string>;
  expectedDeliveryDate: FormControl<string>;
  amount: FormControl<number>;
  productId: FormControl<number | null | undefined>;
}>;

type ProductForm = FormGroup<{
  id: FormControl<number>;
  name: FormControl<string>;
  unitsInStock: FormControl<number>;
  unitPrice: FormControl<number>;
  unit: FormControl<string>;
  discontinued: FormControl<boolean>;
  orders: FormArray<OrderForm>;
}>;

@Component({
  selector: 'app-admin-product-edit',
  standalone: true,
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditComponent {
  fb = inject(NonNullableFormBuilder);
  productService = inject(ProductService);
  private readonly router = inject(Router);

  productId = input<number | undefined>(undefined);
  productId$ = toObservable(this.productId);

  form: ProductForm = this.fb.group({
    id: this.fb.control(0),
    name: this.fb.control('', [Validators.required]),
    unitsInStock: this.fb.control(0, [Validators.required, Validators.min(0)]),
    unitPrice: this.fb.control(0, [Validators.required, Validators.min(0)]),
    unit: this.fb.control('', [Validators.required]),
    discontinued: this.fb.control(false),
    orders: this.fb.array<OrderForm>([]),
  });

  private deletedOrderIds: number[] = [];

  constructor() {
    this.productId$
      .pipe(
        takeUntilDestroyed(),
        switchMap((id) => {
          if (id) {
            return this.productService.getProductById(id);
          }
          return of(null);
        })
      )
      .subscribe((product) => {
        this.deletedOrderIds = [];
        this.orders.clear();
        if (product) {
          this.form.reset({
            id: product.id,
            name: product.name,
            unitsInStock: product.unitsInStock,
            unitPrice: product.unitPrice,
            unit: product.unit,
            discontinued: product.discontinued,
          });
          product.orders.forEach((productOrder) => {
            this.orders.push(this.newOrderGroup(productOrder));
          });
        } else {
          this.form.reset({
            id: 0,
            name: '',
            unitsInStock: 0,
            unitPrice: 0,
            unit: '',
            discontinued: false,
          });
        }
      });
  }

  get orders(): FormArray<OrderForm> {
    return this.form.controls.orders;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private newOrderGroup(seed?: Partial<ProductOrderPayload>): OrderForm {
    return this.fb.group({
      id: this.fb.control(seed?.id ?? 0),
      customerName: this.fb.control(seed?.customerName ?? '', [Validators.required]),
      orderDate: this.fb.control(seed?.orderDate ?? this.today(), [Validators.required]),
      expectedDeliveryDate: this.fb.control(seed?.expectedDeliveryDate ?? this.today(), [
        Validators.required,
      ]),
      amount: this.fb.control(seed?.amount ?? 0, [Validators.required, Validators.min(0)]),
      productId: this.fb.control<number | null | undefined>(seed?.productId ?? null),
    });
  }

  addOrder(seed?: Partial<ProductOrderPayload>) {
    this.orders.push(this.newOrderGroup(seed));
  }

  removeOrderAt(i: number) {
    const orderGroup = this.orders.at(i);
    if (!orderGroup) {
      return;
    }
    const orderId = orderGroup.controls.id.value;
    if (orderId && orderId > 0 && !this.deletedOrderIds.includes(orderId)) {
      this.deletedOrderIds.push(orderId);
    }
    this.orders.removeAt(i);
  }

  private buildOrderPayload(o: OrderForm): ProductOrderPayload {
    const v = o.getRawValue();
    return {
      id: v.id && v.id > 0 ? v.id : undefined,
      customerName: v.customerName,
      orderDate: v.orderDate,
      expectedDeliveryDate: v.expectedDeliveryDate,
      amount: v.amount,
      productId: v.productId ?? undefined,
    };
  }

  private buildPayload(): ProductSavePayload {
    const v = this.form.getRawValue();
    return {
      id: v.id && v.id > 0 ? v.id : undefined,
      name: v.name,
      unitsInStock: v.unitsInStock,
      unitPrice: v.unitPrice,
      unit: v.unit,
      discontinued: v.discontinued,
    };
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const productPayload = this.buildPayload();
    const ordersPayload = this.orders.controls.map((o) => this.buildOrderPayload(o));
    this.productService
      .saveProductWithOrders(productPayload, ordersPayload, this.deletedOrderIds)
      .subscribe({
        next: ({ product, orders }) => {
          this.form.patchValue({ id: product.id });
          orders.forEach((order, index) => {
            const control = this.orders.at(index);
            if (control) {
              control.patchValue({
                id: order.id,
                productId: order.productId,
                customerName: order.customerName,
                orderDate: order.orderDate,
                expectedDeliveryDate: order.expectedDeliveryDate,
                amount: order.amount,
              });
            }
          });
          this.deletedOrderIds = [];
          if (product.id) {
            this.router.navigate(['/admin/products', product.id]);
          }
        },
        error: (error) => {
          console.error('Failed to save product with orders', error);
        },
      });
  }
}
