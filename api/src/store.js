'use strict';

const { Product, Order } = require('./models');

const users = [
  {
    id: 'user-1',
    email: 'development@development.com',
    name: 'Oytun',
    passwordHash:
      'fb2a976e3102fd4e3a562c29deded6cb:122368a248c276aead3e66218fc303360e69177bdbdba1ae4e6b9289fd7beec41495d722a75c8fcf847500977d60531635040bd89c98b53acb5970a02a11da38',
  },
];

const productSeedData = [
  { name: 'Notebook', unitsInStock: 120, unitPrice: 7.5, unit: 'pcs' },
  { name: 'Pen', unitsInStock: 500, unitPrice: 1.2, unit: 'pcs' },
  { name: 'Backpack', unitsInStock: 80, unitPrice: 42.0, unit: 'pcs' },
  { name: 'Stapler', unitsInStock: 60, unitPrice: 15.5, unit: 'pcs' },
  { name: 'Highlighter Set', unitsInStock: 150, unitPrice: 9.99, unit: 'set' },
  { name: 'Whiteboard Marker', unitsInStock: 200, unitPrice: 2.5, unit: 'pcs' },
  { name: 'Desk Organizer', unitsInStock: 75, unitPrice: 18.25, unit: 'pcs' },
  { name: 'Office Chair', unitsInStock: 25, unitPrice: 210.0, unit: 'pcs' },
  { name: 'Standing Desk', unitsInStock: 18, unitPrice: 420.0, unit: 'pcs' },
  { name: 'Filing Cabinet', unitsInStock: 12, unitPrice: 289.0, unit: 'pcs' },
  { name: 'Paper Clips', unitsInStock: 2000, unitPrice: 0.02, unit: 'pcs' },
  { name: 'Binder Clips', unitsInStock: 900, unitPrice: 0.15, unit: 'pcs' },
  { name: 'Sticky Notes', unitsInStock: 500, unitPrice: 1.45, unit: 'pad' },
  { name: 'Letter Envelope', unitsInStock: 800, unitPrice: 0.12, unit: 'pcs' },
  { name: 'Shipping Box Small', unitsInStock: 400, unitPrice: 0.75, unit: 'pcs' },
  { name: 'Shipping Box Medium', unitsInStock: 300, unitPrice: 1.1, unit: 'pcs' },
  { name: 'Shipping Box Large', unitsInStock: 250, unitPrice: 1.5, unit: 'pcs' },
  { name: 'Monitor 24"', unitsInStock: 45, unitPrice: 159.99, unit: 'pcs' },
  { name: 'Monitor Arm', unitsInStock: 65, unitPrice: 85.0, unit: 'pcs' },
  { name: 'Laptop Stand', unitsInStock: 120, unitPrice: 34.5, unit: 'pcs' },
  { name: 'Ergonomic Keyboard', unitsInStock: 70, unitPrice: 99.0, unit: 'pcs' },
  { name: 'Wireless Mouse', unitsInStock: 160, unitPrice: 32.5, unit: 'pcs' },
  { name: 'USB-C Hub', unitsInStock: 110, unitPrice: 44.0, unit: 'pcs' },
  { name: 'External SSD', unitsInStock: 55, unitPrice: 129.0, unit: 'pcs' },
  { name: 'Printer Paper Ream', unitsInStock: 350, unitPrice: 5.6, unit: 'ream' },
  { name: 'Laminating Pouches', unitsInStock: 200, unitPrice: 12.5, unit: 'box' },
  { name: 'Desk Lamp', unitsInStock: 90, unitPrice: 48.75, unit: 'pcs' },
  { name: 'Extension Cord', unitsInStock: 140, unitPrice: 14.5, unit: 'pcs' },
  { name: 'Surge Protector', unitsInStock: 130, unitPrice: 24.0, unit: 'pcs' },
  { name: 'Ethernet Cable', unitsInStock: 300, unitPrice: 8.2, unit: 'pcs' },
  { name: 'Webcam HD', unitsInStock: 80, unitPrice: 79.0, unit: 'pcs' },
  { name: 'Noise Cancelling Headset', unitsInStock: 45, unitPrice: 189.0, unit: 'pcs' },
  { name: 'Conference Speaker', unitsInStock: 35, unitPrice: 249.0, unit: 'pcs' },
  { name: 'Portable Projector', unitsInStock: 28, unitPrice: 329.0, unit: 'pcs' },
  { name: 'Travel Mug', unitsInStock: 210, unitPrice: 18.0, unit: 'pcs' },
  { name: 'Water Bottle', unitsInStock: 260, unitPrice: 12.5, unit: 'pcs' },
  { name: 'Snack Pack', unitsInStock: 320, unitPrice: 4.75, unit: 'pack' },
  { name: 'Cleaning Wipes', unitsInStock: 240, unitPrice: 6.4, unit: 'canister' },
  { name: 'Hand Sanitizer', unitsInStock: 280, unitPrice: 3.2, unit: 'bottle' },
  { name: 'First Aid Kit', unitsInStock: 50, unitPrice: 54.0, unit: 'pcs' },
  { name: 'Cable Organizer', unitsInStock: 150, unitPrice: 11.0, unit: 'pcs' },
  { name: 'Battery Pack', unitsInStock: 95, unitPrice: 39.0, unit: 'pcs' },
  { name: 'Power Adapter', unitsInStock: 110, unitPrice: 27.0, unit: 'pcs' },
  { name: 'Premium Notebook', unitsInStock: 140, unitPrice: 12.5, unit: 'pcs' },
  { name: 'Gel Pen Set', unitsInStock: 180, unitPrice: 7.8, unit: 'set' },
  { name: 'Mechanical Pencil', unitsInStock: 160, unitPrice: 3.6, unit: 'pcs' },
  { name: 'Planner 2024', unitsInStock: 90, unitPrice: 22.0, unit: 'pcs' },
  { name: 'Desk Calendar', unitsInStock: 85, unitPrice: 14.0, unit: 'pcs' },
  { name: 'Mouse Pad', unitsInStock: 200, unitPrice: 9.5, unit: 'pcs' },
  { name: 'Chair Mat', unitsInStock: 40, unitPrice: 65.0, unit: 'pcs' },
];

const products = productSeedData.map(
  (item, index) =>
    new Product(
      index + 1,
      item.name,
      item.unitsInStock,
      item.unitPrice,
      item.unit || 'pcs',
      Boolean(item.discontinued),
      []
    )
);

let productSequence = products.length + 1;
let orderSequence = 1;

const orders = [];

const seedMockOrders = () => {
  const customerNames = [
    'Acme Logistics',
    'Globex Corporation',
    'Initech',
    'Umbrella Retail',
    'Soylent Foods',
    'Stark Industries',
    'Wayne Enterprises',
    'Wonka Distributors',
    'Tyrell Systems',
    'Cyberdyne Labs',
    'Genco Pura',
    'Oscorp',
  ];
  const totalOrders = 240;
  const baseDate = new Date('2024-01-01T09:00:00.000Z');

  for (let i = 0; i < totalOrders; i += 1) {
    const product = products[i % products.length];
    const customerName = customerNames[i % customerNames.length];
    const orderDate = new Date(baseDate.getTime() - i * 36 * 60 * 60 * 1000);
    const expectedDeliveryDate = new Date(
      orderDate.getTime() + (3 + (i % 7)) * 24 * 60 * 60 * 1000
    );
    const amount = 5 + (i % 20);

    const order = new Order(
      orderSequence++,
      customerName,
      orderDate.toISOString(),
      expectedDeliveryDate.toISOString(),
      amount,
      product.id
    );

    orders.push({ userId: users[0].id, order });
    product.orders.push(order);
  }
};

seedMockOrders();

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
  // const testError = new Error('Test error');
  // testError.statusCode = 500;
  // throw testError;
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
