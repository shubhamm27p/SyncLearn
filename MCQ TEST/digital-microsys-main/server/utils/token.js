const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate a signed JWT token for a given user ID.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify a JWT token and return the decoded payload.
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = { generateToken, verifyToken };
