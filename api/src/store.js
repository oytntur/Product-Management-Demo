'use strict';

const { Product, Order } = require('./models');

const users = [];

const products = [
  new Product(1, 'Notebook', 120, 7.5, 'pcs', false, []),
  new Product(2, 'Pen', 500, 1.2, 'pcs', false, []),
  new Product(3, 'Backpack', 80, 42.0, 'pcs', false, []),
];

let productSequence = products.length + 1;
let orderSequence = 1;

const orders = [];

const addUser = (user) => {
  users.push(user);
  return user;
};

const getUserByEmail = (email) => users.find((user) => user.email === email);

const serializeOrder = (order) => ({ ...order });

const serializeProduct = (product) => ({
  id: product.id,
  name: product.name,
  unitsInStock: product.unitsInStock,
  unitPrice: product.unitPrice,
  unit: product.unit,
  discontinued: product.discontinued,
  orders: product.orders.map(serializeOrder),
});

const listProducts = () => products.map(serializeProduct);

const getProductById = (id) => products.find((product) => product.id === id);

const getProductSnapshotById = (id) => {
  const product = getProductById(id);
  if (!product) {
    return null;
  }

  return serializeProduct(product);
};

const addOrder = ({ userId, customerName, orderDate, expectedDeliveryDate, amount, productId }) => {
  const product = getProductById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const order = new Order(
    orderSequence++,
    customerName,
    orderDate,
    expectedDeliveryDate,
    amount,
    productId
  );

  orders.push({ userId, order });
  product.orders.push(order);

  return order;
};

const listOrdersForUser = (userId) =>
  orders.filter((entry) => entry.userId === userId).map((entry) => serializeOrder(entry.order));

const listAllOrders = () =>
  orders.map((entry) => ({ userId: entry.userId, order: serializeOrder(entry.order) }));

const getOrderEntryById = (orderId) => orders.find((entry) => entry.order.id === orderId);

const getOrderForUser = (orderId, userId) => {
  const entry = getOrderEntryById(orderId);
  if (!entry || entry.userId !== userId) {
    return null;
  }

  return serializeOrder(entry.order);
};

const updateOrderForUser = (orderId, userId, updates) => {
  const entry = getOrderEntryById(orderId);
  if (!entry) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (entry.userId !== userId) {
    const err = new Error('You are not allowed to modify this order');
    err.statusCode = 403;
    throw err;
  }

  const order = entry.order;

  const nextProductId = updates.productId ?? order.productId;
  if (nextProductId !== order.productId) {
    const nextProduct = getProductById(nextProductId);
    if (!nextProduct) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const prevProduct = getProductById(order.productId);
    if (prevProduct) {
      prevProduct.orders = prevProduct.orders.filter((item) => item.id !== order.id);
    }
    nextProduct.orders.push(order);
    order.productId = nextProductId;
  }

  if (typeof updates.customerName === 'string') {
    order.customerName = updates.customerName;
  }

  if (typeof updates.amount === 'number' && Number.isFinite(updates.amount) && updates.amount > 0) {
    order.amount = updates.amount;
  }

  if (updates.orderDate instanceof Date) {
    order.orderDate = updates.orderDate;
  } else if (typeof updates.orderDate === 'string') {
    order.orderDate = updates.orderDate;
  }

  if (updates.expectedDeliveryDate instanceof Date) {
    order.expectedDeliveryDate = updates.expectedDeliveryDate;
  } else if (typeof updates.expectedDeliveryDate === 'string') {
    order.expectedDeliveryDate = updates.expectedDeliveryDate;
  }

  return serializeOrder(order);
};

const deleteOrderForUser = (orderId, userId) => {
  const index = orders.findIndex((entry) => entry.order.id === orderId);
  if (index === -1) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const entry = orders[index];
  if (entry.userId !== userId) {
    const err = new Error('You are not allowed to delete this order');
    err.statusCode = 403;
    throw err;
  }

  orders.splice(index, 1);

  const product = getProductById(entry.order.productId);
  if (product) {
    product.orders = product.orders.filter((item) => item.id !== entry.order.id);
  }

  return serializeOrder(entry.order);
};

const createProduct = ({
  name,
  unitsInStock = 0,
  unitPrice = 0,
  unit = 'pcs',
  discontinued = false,
}) => {
  if (typeof name !== 'string' || !name.trim()) {
    const err = new Error('Product name is required');
    err.statusCode = 400;
    throw err;
  }

  const stockValue = Number(unitsInStock);
  const priceValue = Number(unitPrice);

  if (!Number.isFinite(stockValue) || stockValue < 0) {
    const err = new Error('unitsInStock must be a non-negative number');
    err.statusCode = 400;
    throw err;
  }

  if (!Number.isFinite(priceValue) || priceValue < 0) {
    const err = new Error('unitPrice must be a non-negative number');
    err.statusCode = 400;
    throw err;
  }

  const product = new Product(
    productSequence++,
    name.trim(),
    stockValue,
    priceValue,
    typeof unit === 'string' && unit.trim() ? unit.trim() : 'pcs',
    Boolean(discontinued),
    []
  );

  products.push(product);

  return serializeProduct(product);
};

const updateProduct = (id, updates) => {
  const product = getProductById(id);
  const testError = new Error('Test error');
  testError.statusCode = 500;
  throw testError;
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  if (typeof updates.name === 'string' && updates.name.trim()) {
    product.name = updates.name.trim();
  }

  if (updates.unitsInStock !== undefined) {
    const value = Number(updates.unitsInStock);
    if (!Number.isFinite(value) || value < 0) {
      const err = new Error('unitsInStock must be a non-negative number');
      err.statusCode = 400;
      throw err;
    }
    product.unitsInStock = value;
  }

  if (updates.unitPrice !== undefined) {
    const value = Number(updates.unitPrice);
    if (!Number.isFinite(value) || value < 0) {
      const err = new Error('unitPrice must be a non-negative number');
      err.statusCode = 400;
      throw err;
    }
    product.unitPrice = value;
  }

  if (updates.unit !== undefined) {
    if (typeof updates.unit !== 'string' || !updates.unit.trim()) {
      const err = new Error('unit must be a non-empty string');
      err.statusCode = 400;
      throw err;
    }
    product.unit = updates.unit.trim();
  }

  if (updates.discontinued !== undefined) {
    product.discontinued = Boolean(updates.discontinued);
  }

  return serializeProduct(product);
};

const deleteProduct = (id) => {
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const [removed] = products.splice(index, 1);

  for (let orderIndex = orders.length - 1; orderIndex >= 0; orderIndex -= 1) {
    if (orders[orderIndex].order.productId === id) {
      orders.splice(orderIndex, 1);
    }
  }

  return serializeProduct(removed);
};

module.exports = {
  addUser,
  getUserByEmail,
  listProducts,
  addOrder,
  listOrdersForUser,
  getProductById,
  getProductSnapshotById,
  listAllOrders,
  getOrderForUser,
  updateOrderForUser,
  deleteOrderForUser,
  createProduct,
  updateProduct,
  deleteProduct,
};
