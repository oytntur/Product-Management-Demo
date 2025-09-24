import { FormControl, FormGroup } from '@angular/forms';

export interface Order {
  id: number;
  customerName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  amount: number;
  productId: number;
}
export type OrderForm = FormGroup<{
  id: FormControl<number | null>;
  customerName: FormControl<string>;
  orderDate: FormControl<string>;
  expectedDeliveryDate: FormControl<string>;
  amount: FormControl<number>;
  productId: FormControl<number | null>;
}>;
