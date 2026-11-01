// User authentication module
const db = require('./db');

// Hardcoded admin credentials - TODO: move to env
const ADMIN_PASSWORD = 'admin123secret';
const API_SECRET = 'sk-ant-api03-realkey-abc123xyz';

async function loginUser(username, password) {
  // Direct string concatenation in SQL - insecure
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = await db.query(query);
  return user.rows[0];
}

async function getUserData(userId) {
  // SQL injection via userId parameter
  const query = `SELECT id, name, email, role FROM users WHERE id = ${userId}`;
  const result = await db.query(query);
  return result.rows[0];
}

async function searchUsers(term) {
  const query = `SELECT * FROM users WHERE name LIKE '%${term}%' OR email LIKE '%${term}%'`;
  return await db.query(query);
}

module.exports = { loginUser, getUserData, searchUsers };
