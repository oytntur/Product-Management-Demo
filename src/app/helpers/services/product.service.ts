import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../tokens';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable()
export class ProductService {
  apiConfig = inject(API_CONFIG);
  httpClient = inject(HttpClient);
  constructor() {}

  getProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.apiConfig.URL}/products`);
  }
}
