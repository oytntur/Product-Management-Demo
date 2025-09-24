import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../tokens';
import { defer, firstValueFrom, map, Observable, tap } from 'rxjs';
import { Product } from '../models/product.model';
import { showToast } from '../ui/toast.helper';
import {
  CreateOrderPayload,
  OrderService,
  UpdateOrderPayload,
} from './order.service';
import { Order } from '../models/order.model';

export interface ProductCreatePayload {
  name: string;
  unitsInStock?: number;
  unitPrice?: number;
  unit?: string;
  discontinued?: boolean;
}

export type ProductUpdatePayload = Partial<ProductCreatePayload>;

export interface ProductSavePayload extends ProductCreatePayload {
  id?: number;
}

export interface ProductOrderPayload {
  id?: number;
  customerName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  amount: number;
  productId?: number | null;
}

type RollbackAction = () => Promise<void>;

@Injectable()
export class ProductService {
  private readonly apiConfig = inject(API_CONFIG);
  private readonly httpClient = inject(HttpClient);
  private readonly apiRoot = this.apiConfig.URL.replace(/\/+$/, '');
  private readonly orderService = inject(OrderService);

  constructor() {}

  private buildUrl(path: string): string {
    return `${this.apiRoot}${path}`;
  }

  getProducts(): Observable<Product[]> {
    return this.httpClient
      .get<{ products: Product[] }>(this.buildUrl('/products'))
      .pipe(map((response) => response.products ?? []));
  }

  getProductById(id: number): Observable<Product> {
    return this.httpClient
      .get<{ product: Product }>(this.buildUrl(`/products/${id}`))
      .pipe(map((response) => response.product));
  }

  createProduct(
    payload: ProductCreatePayload,
    options: { notify?: boolean } = {}
  ): Observable<Product> {
    const body = this.toProductBody(payload);

    console.log('Creating product with body:', body);
    const { notify = true } = options;

    return this.httpClient
      .post<{ product: Product }>(this.buildUrl('/products'), body)
      .pipe(
        tap(() => {
          if (notify) {
            showToast('Product added successfully', 'success');
          }
        }),
        map((response) => response.product)
      );
  }

  updateProduct(
    id: number,
    updates: ProductUpdatePayload,
    options: { notify?: boolean } = {}
  ): Observable<Product> {
    const body = this.toProductBody(updates);
    const { notify = true } = options;

    return this.httpClient
      .put<{ product: Product }>(this.buildUrl(`/products/${id}`), body)
      .pipe(
        tap(() => {
          if (notify) {
            showToast('Product updated successfully', 'success');
          }
        }),
        map((response) => response.product)
      );
  }

  deleteProduct(id: number, options: { notify?: boolean } = {}): Observable<Product> {
    const { notify = true } = options;
    return this.httpClient
      .delete<{ product: Product }>(this.buildUrl(`/products/${id}`))
      .pipe(
        tap(() => {
          if (notify) {
            showToast('Product removed successfully', 'success');
          }
        }),
        map((response) => response.product)
      );
  }

  private toProductBody(payload: ProductCreatePayload | ProductUpdatePayload) {
    const body: Record<string, unknown> = {};

    if (payload.name !== undefined) {
      body['name'] = payload.name;
    }
    if (payload.unitsInStock !== undefined) {
      body['unitsInStock'] = payload.unitsInStock;
    }
    if (payload.unitPrice !== undefined) {
      body['unitPrice'] = payload.unitPrice;
    }
    if (payload.unit !== undefined) {
      body['unit'] = payload.unit;
    }
    if (payload.discontinued !== undefined) {
      body['discontinued'] = payload.discontinued;
    }

    return body;
  }

  saveProductWithOrders(
    productPayload: ProductSavePayload,
    orders: ProductOrderPayload[],
    deletedOrderIds: number[] = []
  ): Observable<{ product: Product; orders: Order[] }> {
    return defer(() =>
      this.executeSaveProductWithOrders(productPayload, orders, deletedOrderIds)
    );
  }

  private async executeSaveProductWithOrders(
    productPayload: ProductSavePayload,
    orders: ProductOrderPayload[],
    deletedOrderIds: number[]
  ): Promise<{ product: Product; orders: Order[] }> {
    const rollbackActions: RollbackAction[] = [];

    try {
      const savedProduct = await this.saveProductTransactional(productPayload, rollbackActions);
      const savedOrders = await this.saveOrUpdateOrdersTransactional(
        savedProduct.id,
        orders,
        rollbackActions
      );
      await this.deleteOrdersTransactional(deletedOrderIds, rollbackActions);

      return { product: savedProduct, orders: savedOrders };
    } catch (error) {
      await this.runRollbacks(rollbackActions);
      throw error;
    }
  }

  private async saveProductTransactional(
    productPayload: ProductSavePayload,
    rollbackActions: RollbackAction[]
  ): Promise<Product> {
    const { id, ...rest } = productPayload;

    if (id && id > 0) {
      const originalProduct = await firstValueFrom(this.getProductById(id));
      const updatedProduct = await firstValueFrom(this.updateProduct(id, rest));
      rollbackActions.push(async () => {
        await firstValueFrom(
          this.updateProduct(id, this.toProductUpdatePayload(originalProduct), { notify: false })
        );
      });
      return updatedProduct;
    }

    const createdProduct = await firstValueFrom(this.createProduct(rest));
    rollbackActions.push(async () => {
      await firstValueFrom(this.deleteProduct(createdProduct.id, { notify: false }));
    });
    return createdProduct;
  }

  private async saveOrUpdateOrdersTransactional(
    productId: number,
    orders: ProductOrderPayload[],
    rollbackActions: RollbackAction[]
  ): Promise<Order[]> {
    const persistedOrders: Order[] = [];

    for (const orderPayload of orders) {
      if (orderPayload.id && orderPayload.id > 0) {
        const originalOrder = await firstValueFrom(
          this.orderService.getOrderById(orderPayload.id)
        );
        const updatePayload: UpdateOrderPayload = {
          productId,
          amount: orderPayload.amount,
          expectedDeliveryDate: orderPayload.expectedDeliveryDate,
          orderDate: orderPayload.orderDate,
          customerName: orderPayload.customerName,
        };
        const updatedOrder = await firstValueFrom(
          this.orderService.updateOrder(orderPayload.id, updatePayload)
        );
        rollbackActions.push(async () => {
          await firstValueFrom(
            this.orderService.updateOrder(
              orderPayload.id!,
              this.toOrderUpdatePayload(originalOrder),
              { notify: false }
            )
          );
        });
        persistedOrders.push(updatedOrder);
        continue;
      }

      const createPayload: CreateOrderPayload = {
        productId,
        amount: orderPayload.amount,
        expectedDeliveryDate: orderPayload.expectedDeliveryDate,
        customerName: orderPayload.customerName,
      };
      const createdOrder = await firstValueFrom(
        this.orderService.createOrder(createPayload)
      );
      rollbackActions.push(async () => {
        await firstValueFrom(
          this.orderService.deleteOrder(createdOrder.id, { notify: false })
        );
      });
      persistedOrders.push(createdOrder);
    }

    return persistedOrders;
  }

  private async deleteOrdersTransactional(
    deletedOrderIds: number[],
    rollbackActions: RollbackAction[]
  ): Promise<void> {
    for (const orderId of deletedOrderIds) {
      const deletedOrder = await firstValueFrom(
        this.orderService.deleteOrder(orderId)
      );
      rollbackActions.push(async () => {
        const recreatedOrder = await firstValueFrom(
          this.orderService.createOrder(
            {
              productId: deletedOrder.productId,
              amount: deletedOrder.amount,
              expectedDeliveryDate: deletedOrder.expectedDeliveryDate,
              customerName: deletedOrder.customerName,
            },
            { notify: false }
          )
        );
        if (deletedOrder.orderDate !== recreatedOrder.orderDate) {
          await firstValueFrom(
            this.orderService.updateOrder(
              recreatedOrder.id,
              { orderDate: deletedOrder.orderDate },
              { notify: false }
            )
          );
        }
      });
    }
  }

  private async runRollbacks(actions: RollbackAction[]): Promise<void> {
    for (const action of [...actions].reverse()) {
      try {
        await action();
      } catch (rollbackError) {
        console.error('Rollback action failed', rollbackError);
      }
    }
  }

  private toProductUpdatePayload(product: Product): ProductUpdatePayload {
    return {
      name: product.name,
      unitsInStock: product.unitsInStock,
      unitPrice: product.unitPrice,
      unit: product.unit,
      discontinued: product.discontinued,
    };
  }

  private toOrderUpdatePayload(order: Order): UpdateOrderPayload {
    return {
      productId: order.productId,
      amount: order.amount,
      expectedDeliveryDate: order.expectedDeliveryDate,
      orderDate: order.orderDate,
      customerName: order.customerName,
    };
  }
}
