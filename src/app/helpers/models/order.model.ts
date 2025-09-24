export class Order {
  constructor(
    public id: number,
    public customerName: string,
    public orderDate: Date,
    public expectedDeliveryDate: Date,
    public amount: number,
    public productId: number
  ) {}
}
