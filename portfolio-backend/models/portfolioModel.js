// models/portfolioModel.js
const pool = require('../config/db');

// Get all portfolios with investor name (JOIN)
const getAllPortfolios = async () => {
  const result = await pool.query(`
    SELECT 
      p.portfolio_id,
      p.portfolio_name,
      p.portfolio_name AS name,
      p.total_value,
      p.creation_date,
      p.creation_date AS created_at,
      p.investor_id,
      i.name          AS investor_name,
      i.risk_profile
    FROM portfolio p
    JOIN investor i ON p.investor_id = i.investor_id
    ORDER BY p.portfolio_id
  `);
  return result.rows;
};

// Get single portfolio by ID
const getPortfolioById = async (id) => {
  const result = await pool.query(`
    SELECT 
      p.portfolio_id,
      p.portfolio_name,
      p.portfolio_name AS name,
      p.total_value,
      p.creation_date,
      p.creation_date AS created_at,
      p.investor_id,
      i.name          AS investor_name,
      i.email         AS investor_email,
      i.risk_profile
    FROM portfolio p
    JOIN investor i ON p.investor_id = i.investor_id
    WHERE p.portfolio_id = $1
  `, [id]);
  return result.rows[0];
};

// Create new portfolio
const createPortfolio = async ({ portfolio_name, name, total_value = 0, creation_date, investor_id }) => {
  const finalName = portfolio_name || name;
  const result = await pool.query(`
    INSERT INTO portfolio (portfolio_name, total_value, creation_date, investor_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *, portfolio_name AS name, creation_date AS created_at
  `, [finalName, total_value || 0, creation_date || new Date().toISOString().split('T')[0], investor_id]);
  return result.rows[0];
};

// Update portfolio
const updatePortfolio = async (id, { portfolio_name, name, total_value }) => {
  const finalName = portfolio_name || name;
  const result = await pool.query(`
    UPDATE portfolio 
    SET portfolio_name = COALESCE($1, portfolio_name),
        total_value = COALESCE($2, total_value)
    WHERE portfolio_id = $3
    RETURNING *, portfolio_name AS name, creation_date AS created_at
  `, [finalName, total_value, id]);
  return result.rows[0];
};

// Delete portfolio
const deletePortfolio = async (id) => {
  await pool.query('DELETE FROM investment WHERE portfolio_id = $1', [id]);
  await pool.query('DELETE FROM transactions WHERE portfolio_id = $1', [id]);
  const result = await pool.query(`
    DELETE FROM portfolio 
    WHERE portfolio_id = $1 
    RETURNING *
  `, [id]);
  return result.rows[0];
};

// Calculate total portfolio value from investments + current market prices
const getPortfolioPerformance = async (id) => {
  const result = await pool.query(`
    SELECT
      p.portfolio_id,
      p.portfolio_name,
      p.portfolio_name AS name,
      i.name                                              AS investor_name,
      COALESCE(SUM(inv.quantity * inv.purchase_price), 0) AS total_invested,
      COALESCE(SUM(inv.quantity * md.current_price), 0)   AS current_value,
      ROUND(
        (COALESCE(SUM(inv.quantity * md.current_price), 0) - COALESCE(SUM(inv.quantity * inv.purchase_price), 0))
        / NULLIF(SUM(inv.quantity * inv.purchase_price), 0) * 100,
        2
      )                                                   AS return_percentage
    FROM portfolio p
    JOIN investor i       ON p.investor_id = i.investor_id
    LEFT JOIN investment inv   ON inv.portfolio_id = p.portfolio_id
    LEFT JOIN market_data md   ON md.asset_id = inv.asset_id
    WHERE p.portfolio_id = $1
    GROUP BY p.portfolio_id, p.portfolio_name, i.name
  `, [id]);
  return result.rows[0];
};

// Summary of all portfolios performance
const getAllPortfolioPerformance = async () => {
  const result = await pool.query(`
    SELECT
      p.portfolio_id,
      p.portfolio_name,
      p.portfolio_name AS name,
      i.name                                              AS investor_name,
      COALESCE(SUM(inv.quantity * inv.purchase_price), 0) AS total_invested,
      COALESCE(SUM(inv.quantity * md.current_price), 0)   AS current_value,
      ROUND(
        (COALESCE(SUM(inv.quantity * md.current_price), 0) - COALESCE(SUM(inv.quantity * inv.purchase_price), 0))
        / NULLIF(SUM(inv.quantity * inv.purchase_price), 0) * 100,
        2
      )                                                   AS return_percentage
    FROM portfolio p
    JOIN investor i       ON p.investor_id = i.investor_id
    LEFT JOIN investment inv   ON inv.portfolio_id = p.portfolio_id
    LEFT JOIN market_data md   ON md.asset_id = inv.asset_id
    GROUP BY p.portfolio_id, p.portfolio_name, i.name
    ORDER BY return_percentage DESC NULLS LAST
  `);
  return result.rows;
};

module.exports = { 
  getAllPortfolios, 
  getPortfolioById, 
  createPortfolio, 
  updatePortfolio,
  deletePortfolio,
  getPortfolioPerformance, 
  getAllPortfolioPerformance 
};