'use strict';

const http = require('http');
const { URL } = require('url');

const { registerUser, authenticateUser } = require('./auth');
const { listProducts, addOrder, listOrdersForUser, getProductById } = require('./store');
const { sign, verify } = require('./utils/jwt');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const readJsonBody = (req) => new Promise((resolve, reject) => {
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
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    });
    res.end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname } = requestUrl;
  const method = (req.method || 'GET').toUpperCase();

  if (method === 'POST' && pathname === '/auth/register') {
    const body = await readJsonBody(req);
    const user = registerUser({
      email: body.email,
      password: body.password,
      name: body.name,
    });
    sendJson(res, 201, { user });
    return;
  }

  if (method === 'POST' && pathname === '/auth/login') {
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

  if (method === 'GET' && pathname === '/products') {
    getAuthenticatedUser(req);
    const products = listProducts();
    sendJson(res, 200, { products });
    return;
  }

  if (method === 'GET' && pathname === '/orders') {
    const claims = getAuthenticatedUser(req);
    const orders = listOrdersForUser(claims.sub);
    sendJson(res, 200, { orders });
    return;
  }

  if (method === 'POST' && pathname === '/orders') {
    const claims = getAuthenticatedUser(req);
    const body = await readJsonBody(req);

    const productId = Number(body.productId);
    const amount = Number(body.amount);
    const expectedDeliveryDateInput = body.expectedDeliveryDate;
    const customerName = typeof body.customerName === 'string' && body.customerName.trim()
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

    const product = getProductById(productId);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
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
