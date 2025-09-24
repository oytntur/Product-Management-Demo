import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../tokens';
import { map, Observable, tap } from 'rxjs';
import { Product } from '../models/product.model';
import { showToast } from '../ui/toast.helper';

export interface ProductCreatePayload {
  name: string;
  unitsInStock?: number;
  unitPrice?: number;
  unit?: string;
  discontinued?: boolean;
}

export type ProductUpdatePayload = Partial<ProductCreatePayload>;

@Injectable()
export class ProductService {
  private readonly apiConfig = inject(API_CONFIG);
  private readonly httpClient = inject(HttpClient);
  private readonly apiRoot = this.apiConfig.URL.replace(/\/+$/, '');

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

  createProduct(payload: ProductCreatePayload): Observable<Product> {
    const body = this.toProductBody(payload);

    console.log('Creating product with body:', body);

    return this.httpClient
      .post<{ product: Product }>(this.buildUrl('/products'), body)
      .pipe(
        tap(() => showToast('Product added successfully', 'success')),
        map((response) => response.product)
      );
  }

  updateProduct(id: number, updates: ProductUpdatePayload): Observable<Product> {
    const body = this.toProductBody(updates);

    return this.httpClient
      .put<{ product: Product }>(this.buildUrl(`/products/${id}`), body)
      .pipe(
        tap(() => showToast('Product updated successfully', 'success')),
        map((response) => response.product)
      );
  }

  deleteProduct(id: number): Observable<Product> {
    return this.httpClient
      .delete<{ product: Product }>(this.buildUrl(`/products/${id}`))
      .pipe(
        tap(() => showToast('Product removed successfully', 'success')),
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
}
