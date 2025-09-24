import { Order } from './order.model';

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
