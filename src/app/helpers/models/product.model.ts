import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Order, OrderForm } from './order.model';

export interface Product {
  id: number;
  name: string;
  unitsInStock: number;
  unitPrice: number;
  unit: string;
  discontinued: boolean;
  orders: Order[];
  supplierId?: number | null;
  categoryId?: number | null;
  quantityPerUnit?: string | null;
  unitsOnOrder?: number | null;
  reorderLevel?: number | null;
}

export type ProductForm = FormGroup<{
  id: FormControl<number | null>;
  name: FormControl<string>;
  unitsInStock: FormControl<number>;
  unitPrice: FormControl<number>;
  unit: FormControl<string>;
  discontinued: FormControl<boolean>;
  supplierId: FormControl<number | null>;
  categoryId: FormControl<number | null>;
  quantityPerUnit: FormControl<string | null>;
  unitsOnOrder: FormControl<number | null>;
  reorderLevel: FormControl<number | null>;
  orders: FormArray<OrderForm>;
}>;
