import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../tokens';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable()
export class OrderService {
  httpClient = inject(HttpClient);
  apiConfig = inject(API_CONFIG);

  getOrders(): Observable<Order[]> {
    return this.httpClient.get<Order[]>(`${this.apiConfig.URL}/orders`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.httpClient.get<Order>(`${this.apiConfig.URL}/orders/${id}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.httpClient.post<Order>(`${this.apiConfig.URL}/orders`, order);
  }

  updateOrder(order: Order): Observable<Order> {
    return this.httpClient.put<Order>(`${this.apiConfig.URL}/orders/${order.id}`, order);
  }
}
