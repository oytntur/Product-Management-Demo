'use strict';

const { Product, Order } = require('./models');

const users = [];

const products = [
  new Product(1, 'Notebook', 120, 7.5, 'pcs', false, []),
  new Product(2, 'Pen', 500, 1.2, 'pcs', false, []),
  new Product(3, 'Backpack', 80, 42.0, 'pcs', false, []),
];

let orderSequence = 1;

const orders = [];

const addUser = (user) => {
  users.push(user);
  return user;
};

const getUserByEmail = (email) => users.find((user) => user.email === email);

const listProducts = () => products.map((product) => ({
  ...product,
  orders: product.orders.map((order) => ({ ...order })),
}));

const getProductById = (id) => products.find((product) => product.id === id);

const addOrder = ({ userId, customerName, orderDate, expectedDeliveryDate, amount, productId }) => {
  const product = getProductById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const order = new Order(orderSequence++, customerName, orderDate, expectedDeliveryDate, amount, productId);

  orders.push({ userId, order });
  product.orders.push(order);

  return order;
};

const listOrdersForUser = (userId) => orders
  .filter((entry) => entry.userId === userId)
  .map((entry) => ({ ...entry.order }));

module.exports = {
  addUser,
  getUserByEmail,
  listProducts,
  addOrder,
  listOrdersForUser,
  getProductById,
};
