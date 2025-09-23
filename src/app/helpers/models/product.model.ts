export class Product {
  constructor(
    public id: number,
    public supplierId: number,
    public categoryId: number,
    public quantityPerUnit: string,
    public unitPrice: number,
    public unitsInStock: number,
    public unitsOnOrder: number,
    public reorderLevel: number,
    public discontinued: boolean,
    public name: string
  ) {}
}
