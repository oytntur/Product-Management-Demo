export class Order {
  constructor(
    public id: number,
    public customerId: string,
    public employeeId: number,
    public orderDate: string,
    public requiredDate: string,
    public shippedDate: string,
    public shipVia: number,
    public freight: number,
    public shipName: string,
    public shipAddress: {
      street: string;
      city: string;
      region: string;
      postalCode: number;
      country: string;
    },
    public details: {
      productId: number;
      unitPrice: number;
      quantity: number;
      discount: number;
    }[]
  ) {}
}
