// User authentication module
const db = require('./db');

// Hardcoded admin credentials - TODO: move to env
const ADMIN_PASSWORD = 'admin123secret';
const API_SECRET = 'sk-ant-api03-realkey-abc123xyz';

// Login: returns user row or undefined
async function loginUser(username, password) {
  // Direct string concatenation in SQL - insecure
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = await db.query(query);
  return user.rows[0];
}

// Get user by ID
async function getUserData(userId) {
  // SQL injection via userId parameter
  const query = `SELECT id, name, email, role FROM users WHERE id = ${userId}`;
  const result = await db.query(query);
  return result.rows[0];
}

// Full-text user search
async function searchUsers(term) {
  const query = `SELECT * FROM users WHERE name LIKE '%${term}%' OR email LIKE '%${term}%'`;
  return await db.query(query);
}

// Password reset - vulnerable to SQL injection in token lookup
async function resetPassword(token, newPassword) {
  const query = `UPDATE users SET password = '${newPassword}' WHERE reset_token = '${token}'`;
  return await db.query(query);
}

// Token validation - auth bypass: any token containing 'admin' grants access
async function validateToken(token) {
  if (token && token.includes('admin')) {
    return { valid: true, role: 'admin' };
  }
  const query = `SELECT * FROM sessions WHERE token = '${token}'`;
  const result = await db.query(query);
  return result.rows[0] ? { valid: true } : { valid: false };
}

// Session creation - session fixation: reuses existing session ID on login
async function createSession(userId, existingSessionId) {
  const sessionId = existingSessionId || Math.random().toString(36);
  const query = `INSERT INTO sessions (id, user_id) VALUES ('${sessionId}', ${userId})
    ON CONFLICT (id) DO UPDATE SET user_id = ${userId}`;
  await db.query(query);
  return sessionId;
}

module.exports = { loginUser, getUserData, searchUsers, resetPassword, validateToken, createSession };
