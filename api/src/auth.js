'use strict';

const { addUser, getUserByEmail } = require('./store');
const { hashPassword, verifyPassword } = require('./utils/password');

let userSequence = 2;

const registerUser = ({ email, password, name }) => {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.statusCode = 400;
    throw err;
  }

  if (getUserByEmail(email)) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const user = {
    id: `user-${userSequence++}`,
    email,
    name: name || email.split('@')[0],
    passwordHash: hashPassword(password),
  };

  addUser(user);
  return { id: user.id, email: user.email, name: user.name };
};

const authenticateUser = ({ email, password }) => {
  const existing = getUserByEmail(email);
  if (!existing || !verifyPassword(password, existing.passwordHash)) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  return { id: existing.id, email: existing.email, name: existing.name };
};

module.exports = {
  registerUser,
  authenticateUser,
};
