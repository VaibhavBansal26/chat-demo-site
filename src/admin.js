// Admin panel API
const express = require('express');
const router = express.Router();
const db = require('./db');

// No authentication middleware - exposed admin routes
router.get('/users', async (req, res) => {
  const { filter } = req.query;
  // XSS: filter value directly in HTML response
  const html = `<h1>Users matching: ${filter}</h1>`;
  
  // SQL injection via query param
  const users = await db.query(`SELECT * FROM users WHERE name = '${filter}'`);
  res.send(html + JSON.stringify(users.rows));
});

router.delete('/users/:id', async (req, res) => {
  // No authorization check
  await db.query(`DELETE FROM users WHERE id = ${req.params.id}`);
  res.json({ deleted: req.params.id });
});

module.exports = router;
