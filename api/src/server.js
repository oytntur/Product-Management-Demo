'use strict';

const http = require('http');
const { URL } = require('url');

const { registerUser, authenticateUser } = require('./auth');
const {
  listProducts,
  addOrder,
  listOrdersForUser,
  getProductSnapshotById,
  getOrderForUser,
  updateOrderForUser,
  deleteOrderForUser,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('./store');
const { sign, verify } = require('./utils/jwt');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

const randomDelay = (minMs = 3000, maxMs = 5000) => {
  const duration = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, duration));
};

const ALLOWED_ORIGINS = new Set(['http://localhost:4200', 'http://127.0.0.1:4200']);

const applyCors = (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  }

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
};

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        const parseError = new Error('Invalid JSON payload');
        parseError.statusCode = 400;
        reject(parseError);
      }
    });
    req.on('error', reject);
  });

const extractToken = (req) => {
  const header = req.headers['authorization'];
  if (!header || typeof header !== 'string') {
    return null;
  }
  if (!header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim();
};

const getAuthenticatedUser = (req) => {
  const token = extractToken(req);
  if (!token) {
    const err = new Error('Missing bearer token');
    err.statusCode = 401;
    throw err;
  }
  try {
    return verify(token, JWT_SECRET);
  } catch (err) {
    const authError = new Error('Invalid or expired token');
    authError.statusCode = 401;
    throw authError;
  }
};

const handleRequest = async (req, res) => {
  if (req.method === 'OPTIONS') {
    applyCors(req, res);
    res.writeHead(204);
    res.end();
    return;
  }

  applyCors(req, res);
  await randomDelay(); // Introduce artificial latency for all endpoints

  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname } = requestUrl;
  const method = (req.method || 'GET').toUpperCase();
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'auth') {
    if (segments.length === 2 && method === 'POST' && segments[1] === 'register') {
      const body = await readJsonBody(req);
      const user = registerUser({
        email: body.email,
        password: body.password,
        name: body.name,
      });
      sendJson(res, 201, { user });
      return;
    }

    if (segments.length === 2 && method === 'POST' && segments[1] === 'login') {
      const body = await readJsonBody(req);
      const user = authenticateUser({
        email: body.email,
        password: body.password,
      });
      const token = sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, {
        expiresInSeconds: TOKEN_TTL_SECONDS,
      });
      sendJson(res, 200, { token, user });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  if (segments[0] === 'products') {
    getAuthenticatedUser(req);

    if (segments.length === 1) {
      if (method === 'GET') {
        const products = listProducts();
        sendJson(res, 200, { products });
        return;
      }

      if (method === 'POST') {
        const body = await readJsonBody(req);
        const product = createProduct({
          name: body.name,
          unitsInStock: body.unitsInStock,
          unitPrice: body.unitPrice,
          unit: body.unit,
          discontinued: body.discontinued,
        });
        sendJson(res, 201, { product });
        return;
      }

      const err = new Error('Method not allowed');
      err.statusCode = 405;
      throw err;
    }

    if (segments.length === 2) {
      const productId = Number.parseInt(segments[1], 10);
      if (!Number.isInteger(productId)) {
        const err = new Error('Product id must be an integer');
        err.statusCode = 400;
        throw err;
      }

      if (method === 'GET') {
        const product = getProductSnapshotById(productId);
        if (!product) {
          const err = new Error('Product not found');
          err.statusCode = 404;
          throw err;
        }
        sendJson(res, 200, { product });
        return;
      }

      if (method === 'PUT') {
        const body = await readJsonBody(req);
        const product = updateProduct(productId, body || {});
        sendJson(res, 200, { product });
        return;
      }

      if (method === 'DELETE') {
        const product = deleteProduct(productId);
        sendJson(res, 200, { product });
        return;
      }

      const err = new Error('Method not allowed');
      err.statusCode = 405;
      throw err;
    }

    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  if (segments[0] === 'orders') {
    const claims = getAuthenticatedUser(req);

    if (segments.length === 1) {
      if (method === 'GET') {
        const orders = listOrdersForUser(claims.sub);
        sendJson(res, 200, { orders });
        return;
      }

      if (method === 'POST') {
        const body = await readJsonBody(req);

        const productId = Number(body.productId);
        const amount = Number(body.amount);
        const expectedDeliveryDateInput = body.expectedDeliveryDate;
        const customerName =
          typeof body.customerName === 'string' && body.customerName.trim()
            ? body.customerName.trim()
            : claims.name;

        if (!Number.isInteger(productId)) {
          const err = new Error('productId must be an integer');
          err.statusCode = 400;
          throw err;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
          const err = new Error('amount must be a positive number');
          err.statusCode = 400;
          throw err;
        }

        const expectedDeliveryDate = new Date(expectedDeliveryDateInput);
        if (Number.isNaN(expectedDeliveryDate.getTime())) {
          const err = new Error('expectedDeliveryDate must be a valid date');
          err.statusCode = 400;
          throw err;
        }

        const order = addOrder({
          userId: claims.sub,
          customerName,
          orderDate: new Date(),
          expectedDeliveryDate,
          amount,
          productId,
        });

        sendJson(res, 201, { order });
        return;
      }

      const err = new Error('Method not allowed');
      err.statusCode = 405;
      throw err;
    }

    if (segments.length === 2) {
      const orderId = Number.parseInt(segments[1], 10);
      if (!Number.isInteger(orderId)) {
        const err = new Error('Order id must be an integer');
        err.statusCode = 400;
        throw err;
      }

      if (method === 'GET') {
        const order = getOrderForUser(orderId, claims.sub);
        if (!order) {
          const err = new Error('Order not found');
          err.statusCode = 404;
          throw err;
        }
        sendJson(res, 200, { order });
        return;
      }

      if (method === 'PUT') {
        const body = await readJsonBody(req);
        const updates = {};

        if (body.productId !== undefined) {
          const nextProductId = Number(body.productId);
          if (!Number.isInteger(nextProductId)) {
            const err = new Error('productId must be an integer');
            err.statusCode = 400;
            throw err;
          }
          updates.productId = nextProductId;
        }

        if (body.amount !== undefined) {
          const nextAmount = Number(body.amount);
          if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
            const err = new Error('amount must be a positive number');
            err.statusCode = 400;
            throw err;
          }
          updates.amount = nextAmount;
        }

        if (body.expectedDeliveryDate !== undefined) {
          const nextExpected = new Date(body.expectedDeliveryDate);
          if (Number.isNaN(nextExpected.getTime())) {
            const err = new Error('expectedDeliveryDate must be a valid date');
            err.statusCode = 400;
            throw err;
          }
          updates.expectedDeliveryDate = nextExpected.toISOString();
        }

        if (body.orderDate !== undefined) {
          const nextOrderDate = new Date(body.orderDate);
          if (Number.isNaN(nextOrderDate.getTime())) {
            const err = new Error('orderDate must be a valid date');
            err.statusCode = 400;
            throw err;
          }
          updates.orderDate = nextOrderDate.toISOString();
        }

        if (body.customerName !== undefined) {
          if (typeof body.customerName !== 'string' || !body.customerName.trim()) {
            const err = new Error('customerName must be a non-empty string');
            err.statusCode = 400;
            throw err;
          }
          updates.customerName = body.customerName.trim();
        }

        const order = updateOrderForUser(orderId, claims.sub, updates);
        sendJson(res, 200, { order });
        return;
      }

      if (method === 'DELETE') {
        const order = deleteOrderForUser(orderId, claims.sub);
        sendJson(res, 200, { order });
        return;
      }

      const err = new Error('Method not allowed');
      err.statusCode = 405;
      throw err;
    }

    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
};

const server = http.createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    sendJson(res, statusCode, { error: err.message || 'Internal server error' });
  }
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`API server listening on http://${HOST}:${PORT}`);
  });
}

server.handleRequest = handleRequest;

module.exports = server;
module.exports.handleRequest = handleRequest;
