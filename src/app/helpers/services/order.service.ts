import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../tokens';
import { map, Observable, tap } from 'rxjs';
import { Order } from '../models/order.model';
import { showToast } from '../ui/toast.helper';

export interface CreateOrderPayload {
  productId: number;
  amount: number;
  expectedDeliveryDate: string;
  customerName?: string;
}

export interface UpdateOrderPayload {
  productId?: number;
  amount?: number;
  expectedDeliveryDate?: string;
  orderDate?: string;
  customerName?: string;
}

@Injectable()
export class OrderService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiRoot = this.apiConfig.URL.replace(/\/+$/, '');

  private buildUrl(path: string): string {
    return `${this.apiRoot}${path}`;
  }

  getOrders(): Observable<Order[]> {
    return this.httpClient
      .get<{ orders: Order[] }>(this.buildUrl('/orders'))
      .pipe(map((response) => response.orders ?? []));
  }

  getOrderById(id: number): Observable<Order> {
    return this.httpClient
      .get<{ order: Order }>(this.buildUrl(`/orders/${id}`))
      .pipe(map((response) => response.order));
  }

  createOrder(
    payload: CreateOrderPayload,
    options: { notify?: boolean } = {}
  ): Observable<Order> {
    const { notify = true } = options;
    return this.httpClient
      .post<{ order: Order }>(this.buildUrl('/orders'), payload)
      .pipe(
        tap(() => {
          if (notify) {
            showToast('Order added successfully', 'success');
          }
        }),
        map((response) => response.order)
      );
  }

  updateOrder(
    id: number,
    updates: UpdateOrderPayload,
    options: { notify?: boolean } = {}
  ): Observable<Order> {
    const { notify = true } = options;
    return this.httpClient
      .put<{ order: Order }>(this.buildUrl(`/orders/${id}`), updates)
      .pipe(
        tap(() => {
          if (notify) {
            showToast('Order updated successfully', 'success');
          }
        }),
        map((response) => response.order)
      );
  }

  deleteOrder(id: number, options: { notify?: boolean } = {}): Observable<Order> {
    const { notify = true } = options;
    return this.httpClient
      .delete<{ order: Order }>(this.buildUrl(`/orders/${id}`))
      .pipe(
        tap(() => {
          if (notify) {
            showToast('Order removed successfully', 'success');
          }
        }),
        map((response) => response.order)
      );
  }

  getOrdersByProductId(productId: number): Observable<Order[]> {
    return this.getOrders().pipe(
      map((orders) => orders.filter((order) => +order.productId === +productId))
    );
  }
}
