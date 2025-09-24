'use strict';

const assert = require('assert');
const { Readable } = require('stream');

const server = require('../src/server');
const handleRequest = server.handleRequest;

class MockRequest extends Readable {
  constructor({ method, path, headers = {}, body = null }) {
    super();
    this.method = method;
    this.url = path;
    this.headers = {
      host: headers.host || 'test.local',
      ...headers,
    };
    this.connection = {
      destroy: () => {
        this.destroyed = true;
      },
    };
    this._body = body ? Buffer.from(body) : null;
    this._bodyPushed = false;
  }

  _read() {
    if (this._body && !this._bodyPushed) {
      this.push(this._body);
    }
    this._bodyPushed = true;
    this.push(null);
  }
}

class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.ended = false;
    this._chunks = [];
  }

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value;
  }

  writeHead(statusCode, headers = {}) {
    this.statusCode = statusCode;
    Object.entries(headers).forEach(([key, value]) => {
      this.setHeader(key, value);
    });
  }

  end(data) {
    if (data) {
      this._chunks.push(Buffer.from(data));
    }
    this.ended = true;
  }

  get body() {
    return Buffer.concat(this._chunks).toString() || '';
  }
}

const invoke = async ({ method, path, headers = {}, json }) => {
  const bodyString = json ? JSON.stringify(json) : null;
  const requestHeaders = { ...headers };
  if (json && !requestHeaders['content-type']) {
    requestHeaders['content-type'] = 'application/json';
  }
  const req = new MockRequest({ method, path, headers: requestHeaders, body: bodyString });
  const res = new MockResponse();

  try {
    await handleRequest(req, res);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
  }

  if (!res.ended) {
    throw new Error(`Response for ${method} ${path} did not end`);
  }

  let parsed;
  if (res.body) {
    try {
      parsed = JSON.parse(res.body);
    } catch (err) {
      throw new Error(`Failed to parse JSON response for ${method} ${path}: ${err.message}`);
    }
  } else {
    parsed = {};
  }

  return { statusCode: res.statusCode, body: parsed };
};

const run = async () => {
  const unique = Date.now();
  const credentials = {
    email: `user_${unique}@example.com`,
    password: 'Str0ngP@ss',
    name: 'Test User',
  };

  const register = await invoke({
    method: 'POST',
    path: '/auth/register',
    json: credentials,
  });
  assert.strictEqual(register.statusCode, 201, `Expected 201 on register, got ${register.statusCode}`);
  assert.ok(register.body.user && register.body.user.id, 'Register response missing user id');

  const login = await invoke({
    method: 'POST',
    path: '/auth/login',
    json: { email: credentials.email, password: credentials.password },
  });
  assert.strictEqual(login.statusCode, 200, `Expected 200 on login, got ${login.statusCode}`);
  assert.ok(login.body.token, 'Login response missing token');

  const token = login.body.token;

  const products = await invoke({
    method: 'GET',
    path: '/products',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(products.statusCode, 200, `Expected 200 on products, got ${products.statusCode}`);
  assert.ok(Array.isArray(products.body.products) && products.body.products.length > 0, 'Products response missing list');
  assert.ok(Array.isArray(products.body.products[0].orders), 'Product does not expose orders array');

  const productId = products.body.products[0].id;
  const orderPayload = {
    productId,
    customerName: 'Test User',
    expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    amount: products.body.products[0].unitPrice * 2,
  };

  const orderCreate = await invoke({
    method: 'POST',
    path: '/orders',
    headers: { authorization: `Bearer ${token}` },
    json: orderPayload,
  });
  assert.strictEqual(orderCreate.statusCode, 201, `Expected 201 on order create, got ${orderCreate.statusCode}`);
  assert.ok(orderCreate.body.order && orderCreate.body.order.id, 'Order create missing order payload');
  assert.strictEqual(orderCreate.body.order.productId, productId, 'Order response has unexpected productId');
  assert.strictEqual(orderCreate.body.order.customerName, orderPayload.customerName, 'Order response has unexpected customerName');

  const orders = await invoke({
    method: 'GET',
    path: '/orders',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.strictEqual(orders.statusCode, 200, `Expected 200 on orders, got ${orders.statusCode}`);
  assert.ok(Array.isArray(orders.body.orders) && orders.body.orders.length > 0, 'Orders response missing list');
  assert.strictEqual(orders.body.orders[0].productId, productId, 'Orders list missing created order');

  const invalidToken = await invoke({
    method: 'GET',
    path: '/products',
    headers: { authorization: 'Bearer invalid.token' },
  });
  assert.strictEqual(invalidToken.statusCode, 401, `Expected 401 on invalid token, got ${invalidToken.statusCode}`);

  const missingToken = await invoke({
    method: 'GET',
    path: '/products',
  });
  assert.strictEqual(missingToken.statusCode, 401, `Expected 401 on missing token, got ${missingToken.statusCode}`);

  console.log('All API endpoint checks passed.');
};

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
