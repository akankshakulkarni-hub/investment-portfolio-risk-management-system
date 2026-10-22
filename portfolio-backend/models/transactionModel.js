// models/transactionModel.js

const pool = require('../config/db');

// Get all transactions with portfolio and asset details
const getAllTransactions = async () => {
  const result = await pool.query(`
    SELECT 
      t.transaction_id,
      t.transaction_type,
      t.transaction_type AS type,
      t.amount,
      t.transaction_date,
      p.portfolio_name,
      p.portfolio_id,
      COALESCE(a.asset_name, 'N/A') AS asset_name,
      COALESCE(a.symbol, 'N/A')     AS symbol,
      i.name                       AS investor_name
    FROM transactions t
    JOIN portfolio p      ON t.portfolio_id = p.portfolio_id
    JOIN investor  i      ON p.investor_id  = i.investor_id
    LEFT JOIN asset a     ON t.asset_id     = a.asset_id
    ORDER BY t.transaction_date DESC
  `);
  return result.rows;
};

// Get transactions for a specific portfolio
const getTransactionsByPortfolio = async (portfolioId) => {
  const result = await pool.query(`
    SELECT 
      t.transaction_id,
      t.transaction_type,
      t.transaction_type AS type,
      t.amount,
      t.transaction_date,
      COALESCE(a.asset_name, 'N/A') AS asset_name,
      COALESCE(a.symbol, 'N/A')     AS symbol
    FROM transactions t
    LEFT JOIN asset a ON t.asset_id = a.asset_id
    WHERE t.portfolio_id = $1
    ORDER BY t.transaction_date DESC
  `, [portfolioId]);
  return result.rows;
};

// Create new transaction
const createTransaction = async ({ transaction_type, type, amount, transaction_date, portfolio_id, asset_id }) => {
  const rawType = transaction_type || type || 'BUY';
  const finalType = String(rawType).toUpperCase();
  const result = await pool.query(`
    INSERT INTO transactions (transaction_type, amount, transaction_date, portfolio_id, asset_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *, transaction_type AS type
  `, [
    finalType,
    amount,
    transaction_date || new Date().toISOString(),
    portfolio_id,
    asset_id || null
  ]);
  return result.rows[0];
};

module.exports = { getAllTransactions, getTransactionsByPortfolio, createTransaction };