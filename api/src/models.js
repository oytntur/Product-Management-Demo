'use strict';

class Product {
  constructor(id, name, unitsInStock, unitPrice, unit, discontinued, orders = []) {
    this.id = id;
    this.name = name;
    this.unitsInStock = unitsInStock;
    this.unitPrice = unitPrice;
    this.unit = unit;
    this.discontinued = discontinued;
    this.orders = orders;
  }
}

class Order {
  constructor(id, customerName, orderDate, expectedDeliveryDate, amount, productId) {
    this.id = id;
    this.customerName = customerName;
    this.orderDate = orderDate;
    this.expectedDeliveryDate = expectedDeliveryDate;
    this.amount = amount;
    this.productId = productId;
  }
}

module.exports = {
  Product,
  Order,
};
