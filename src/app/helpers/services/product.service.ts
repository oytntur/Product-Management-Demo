import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../tokens';
import { delay, Observable, take } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable()
export class ProductService {
  apiConfig = inject(API_CONFIG);
  httpClient = inject(HttpClient);
  constructor() {}

  getProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.apiConfig.URL}/products`);
  }
  getProductById(id: number): Observable<Product> {
    return this.httpClient.get<Product>(`${this.apiConfig.URL}/products/${id}`);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.httpClient
      .put<Product>(`${this.apiConfig.URL}/products/${product.id}`, product)
      .pipe(take(1));
  }
  createProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>(`${this.apiConfig.URL}/products`, product).pipe(take(1));
  }
}
