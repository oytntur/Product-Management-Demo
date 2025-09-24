import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DxDataGridModule, DxFormModule } from 'devextreme-angular';
import { ProductService } from '../../../helpers/services/product.service';
import { OrderService } from '../../../helpers/services/order.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { DataSource } from 'devextreme/common/data';

type OrderForm = FormGroup<{
  id: FormControl<number>; // no nulls
  customerName: FormControl<string>;
  orderDate: FormControl<string>;
  expectedDeliveryDate: FormControl<string>;
  amount: FormControl<number>;
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

class Order {
  constructor(
    public id: number,
    public customerName: string,
    public orderDate: string, // "yyyy-MM-dd"
    public expectedDeliveryDate: string, // "yyyy-MM-dd"
    public amount: number,
    public productId?: number
  ) {}
}

class Product {
  constructor(
    public id: number,
    public name: string,
    public unitsInStock: number,
    public unitPrice: number,
    public unit: string,
    public discontinued: boolean,
    public orders: Order[] = []
  ) {}
}

@Component({
  selector: 'app-admin-product-edit',
  standalone: true,
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
  imports: [ReactiveFormsModule, DxFormModule, DxDataGridModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditComponent {
  fb = inject(NonNullableFormBuilder);
  productService = inject(ProductService);
  orderService = inject(OrderService);

  productId = input<number | undefined>(undefined);
  productId$ = toObservable(this.productId);
  isEditMode = computed(() => !!this.productId());

  form: ProductForm = this.fb.group({
    id: this.fb.control(0),
    name: this.fb.control('', [Validators.required]),
    unitsInStock: this.fb.control(0, [Validators.required, Validators.min(0)]),
    unitPrice: this.fb.control(0, [Validators.required, Validators.min(0)]),
    unit: this.fb.control('', [Validators.required]),
    discontinued: this.fb.control(false),
    orders: this.fb.array<OrderForm>([]),
  });

  formData = model<Product>();
  ordersData = new DataSource({ store: [] });
  productOrders = signal<Order[]>([]);

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
        if (product) {
          const ordersFbArray = this.fb.array<OrderForm>(
            product.orders.map((o) =>
              this.fb.group({
                id: this.fb.control(o.id),
                customerName: this.fb.control(o.customerName, [Validators.required]),
                orderDate: this.fb.control(o.orderDate, [Validators.required]),
                expectedDeliveryDate: this.fb.control(o.expectedDeliveryDate, [
                  Validators.required,
                ]),
                amount: this.fb.control(o.amount, [Validators.required, Validators.min(0)]),
              })
            )
          );
          console.log('Rebuilt Orders FormArray:', ordersFbArray);
          console.log('Orders fb array rawvalue:', ordersFbArray.getRawValue());
          console.log('Orders fb array value:', ordersFbArray.value);
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
          this.productOrders.set(product.orders);
          this.syncToDx();
        }
      });
  }

  get orders(): FormArray<OrderForm> {
    return this.form.controls.orders;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private newOrderGroup(seed?: Partial<Order>): OrderForm {
    return this.fb.group({
      id: this.fb.control(seed?.id ?? 0),
      customerName: this.fb.control(seed?.customerName ?? '', [Validators.required]),
      orderDate: this.fb.control(seed?.orderDate ?? this.today(), [Validators.required]),
      expectedDeliveryDate: this.fb.control(seed?.expectedDeliveryDate ?? this.today(), [
        Validators.required,
      ]),
      amount: this.fb.control(seed?.amount ?? 0, [Validators.required, Validators.min(0)]),
    });
  }

  addOrder(seed?: Partial<Order>) {
    this.orders.push(this.newOrderGroup(seed));
    this.syncToDx();
  }

  removeOrderAt(i: number) {
    this.orders.removeAt(i);
    this.syncToDx();
  }

  private syncToDx() {
    const v = this.form.getRawValue();
    console.log('Syncing to DX:', v);
    this.formData.set({ ...v, orders: this.productOrders() });
    const orders = this.productOrders().map(
      (o) => new Order(o.id, o.customerName, o.orderDate, o.expectedDeliveryDate, o.amount)
    );
    const ordersStore = this.ordersData.store();
    orders.forEach((element) => {
      console.log('Inserting to DX:', element);
      ordersStore.insert(element);
    });
    this.ordersData.load();
  }

  onDxFieldChange(e: any) {
    const { dataField, value } = e;
    if (dataField && (this.form.controls as any)[dataField]) {
      (this.form.controls as any)[dataField].setValue(value);
    }
  }

  onOrderInserted(e: any) {
    this.orders.push(this.newOrderGroup(e.data));
    this.syncToDx();
  }
  onOrderUpdated(e: any) {
    const idx = e.component.getRowIndexByKey(e.key);
    if (idx > -1) this.orders.at(idx).patchValue(e.data);
    this.syncToDx();
  }
  onOrderRemoved(e: any) {
    const idx = e.component.getRowIndexByKey(e.key);
    if (idx > -1) this.removeOrderAt(idx);
  }

  private buildOrderPayload(o: OrderForm, productId: number): Order {
    const v = o.getRawValue();
    return new Order(
      v.id,
      v.customerName,
      v.orderDate,
      v.expectedDeliveryDate,
      v.amount,
      productId
    );
  }

  private buildPayload(): Product {
    const v = this.form.getRawValue();
    return new Product(v.id, v.name, v.unitsInStock, v.unitPrice, v.unit, v.discontinued);
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const payload = this.buildPayload();
    console.log('DX Payload:', payload);

    if (this.isEditMode()) {
      this.productService.updateProduct(payload.id, payload).subscribe((updatedProduct) => {
        console.log('Updated Product:', updatedProduct);
        const productId = updatedProduct.id;

        const orderPayloads = this.orders.controls.map((o) => this.buildOrderPayload(o, productId));
        console.log('Order Payloads:', orderPayloads);

        // Save orders sequentially (could be optimized with forkJoin if needed)
        orderPayloads.forEach((order) => {
          if (order.id && order.id > 0) {
            console.log('Updating Order ID:', order.id, order);
            this.orderService.updateOrder(order.id, order).subscribe((updatedOrder) => {
              console.log('Updated Order:', updatedOrder);
            });
            return;
          }
          console.log('Creating Order for Product ID:', productId, order);
          this.orderService
            .createOrder({
              amount: order.amount,
              customerName: order.customerName,
              expectedDeliveryDate: order.expectedDeliveryDate,
              productId: productId,
            })
            .subscribe((createdOrder) => {
              console.log('Created Order:', createdOrder);
            });
        });
      });
      return;
    }

    this.productService.createProduct(payload).subscribe((createdProduct) => {
      console.log('Created Product:', createdProduct);
      const productId = createdProduct.id;

      const orderPayloads = this.orders.controls.map((o) => this.buildOrderPayload(o, productId));
      console.log('Order Payloads:', orderPayloads);

      // Save orders sequentially (could be optimized with forkJoin if needed)
      orderPayloads.forEach((order) => {
        this.orderService
          .createOrder({
            amount: order.amount,
            customerName: order.customerName,
            expectedDeliveryDate: order.expectedDeliveryDate,
            productId: productId,
          })
          .subscribe((createdOrder) => {
            console.log('Created Order:', createdOrder);
          });
      });
    });
    // this.productService.save(payload).subscribe(...)
  }
}
