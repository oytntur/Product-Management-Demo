import { Order } from './order.model';

export class Product {
  constructor(
    public id: number,
    public name: string,
    public unitsInStock: number,
    public unitPrice: number,
    public unit: string,
    public discontinued: boolean,
    public orders: Order[]
  ) {}
}
