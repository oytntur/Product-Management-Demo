'use strict';

const crypto = require('crypto');

const base64UrlEncode = (input) => Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const base64UrlDecode = (input) => {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
  return Buffer.from(padded, 'base64').toString();
};

const sign = (payload, secret, options = {}) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload };

  if (options.expiresInSeconds) {
    body.exp = Math.floor(Date.now() / 1000) + options.expiresInSeconds;
  }

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(body));
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
};

const verify = (token, secret) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token format');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token structure');
  }

  const [headerEncoded, payloadEncoded, signature] = parts;
  const data = `${headerEncoded}.${payloadEncoded}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    throw new Error('Signature mismatch');
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error('Signature mismatch');
  }

  const payloadJson = base64UrlDecode(payloadEncoded);
  const payload = JSON.parse(payloadJson);

  if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
};

module.exports = {
  sign,
  verify,
};
