// config/db.js
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
});
pool.connect()
  .then((client) => {
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  })
  .catch(err => console.error('❌ PostgreSQL connection error:', err.message));
module.exports = pool;


