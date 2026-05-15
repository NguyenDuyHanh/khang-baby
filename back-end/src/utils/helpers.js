const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate unique IDs
function generateId(prefix, counter) {
  return `${prefix}${String(counter).padStart(4, '0')}`;
}

// Hash password
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Compare passwords
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Create JWT token
function createToken(payload, secret = process.env.JWT_SECRET || 'khang-baby-secret') {
  return jwt.sign(payload, secret, { expiresIn: '30d' });
}

// Verify JWT token
function verifyToken(token, secret = process.env.JWT_SECRET || 'khang-baby-secret') {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Get today's date
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Get date range
function getDateRange(type) {
  const today = new Date();
  const startDate = new Date();

  switch (type) {
    case 'today':
      return { start: getTodayDate(), end: getTodayDate() };
    case '7days':
      startDate.setDate(today.getDate() - 6);
      return { start: startDate.toISOString().split('T')[0], end: getTodayDate() };
    case '30days':
      startDate.setDate(today.getDate() - 29);
      return { start: startDate.toISOString().split('T')[0], end: getTodayDate() };
    case 'month':
      startDate.setDate(1);
      return { start: startDate.toISOString().split('T')[0], end: getTodayDate() };
    default:
      return { start: getTodayDate(), end: getTodayDate() };
  }
}

module.exports = {
  generateId,
  hashPassword,
  comparePassword,
  createToken,
  verifyToken,
  formatCurrency,
  getTodayDate,
  getDateRange,
};
