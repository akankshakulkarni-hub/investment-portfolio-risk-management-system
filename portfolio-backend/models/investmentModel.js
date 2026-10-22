// models/investmentModel.js

const pool = require('../config/db');

// Get all investments with full details (JOIN portfolio + asset + asset_class)
const getAllInvestments = async () => {
  const result = await pool.query(`
    SELECT 
      inv.investment_id,
      inv.quantity,
      inv.purchase_price,
      inv.investment_date,
      inv.quantity * inv.purchase_price   AS total_invested,
      p.portfolio_name,
      p.portfolio_name                    AS portfolio_name_display,
      p.portfolio_id,
      a.asset_name,
      a.asset_name                        AS name,
      a.symbol,
      a.sector,
      COALESCE(ac.class_name, 'Equity')   AS asset_class,
      i.name                              AS investor_name
    FROM investment inv
    JOIN portfolio p       ON inv.portfolio_id = p.portfolio_id
    JOIN asset     a       ON inv.asset_id     = a.asset_id
    LEFT JOIN asset_class ac ON a.class_id     = ac.class_id
    JOIN investor  i       ON p.investor_id    = i.investor_id
    ORDER BY inv.investment_date DESC
  `);
  return result.rows;
};

// Get investments for a specific portfolio
const getInvestmentsByPortfolio = async (portfolioId) => {
  const result = await pool.query(`
    SELECT 
      inv.investment_id,
      inv.quantity,
      inv.purchase_price,
      inv.investment_date,
      inv.quantity * inv.purchase_price   AS total_invested,
      inv.quantity * COALESCE(md.current_price, inv.purchase_price) AS current_value,
      ROUND(
        (COALESCE(md.current_price, inv.purchase_price) - inv.purchase_price) / inv.purchase_price * 100,
        2
      )                                   AS return_pct,
      a.asset_name,
      a.asset_name                        AS name,
      a.symbol,
      COALESCE(ac.class_name, 'Equity')   AS asset_class,
      md.current_price,
      md.volatility
    FROM investment inv
    JOIN asset       a  ON inv.asset_id     = a.asset_id
    LEFT JOIN asset_class ac ON a.class_id = ac.class_id
    LEFT JOIN market_data md ON md.asset_id = a.asset_id
    WHERE inv.portfolio_id = $1
    ORDER BY inv.investment_date DESC
  `, [portfolioId]);
  return result.rows;
};

// Create new investment
const createInvestment = async ({ quantity, purchase_price, investment_date, portfolio_id, asset_id }) => {
  const result = await pool.query(`
    INSERT INTO investment (quantity, purchase_price, investment_date, portfolio_id, asset_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [quantity, purchase_price, investment_date || new Date().toISOString().split('T')[0], portfolio_id, asset_id]);
  return result.rows[0];
};

// Delete investment
const deleteInvestment = async (id) => {
  const result = await pool.query(`
    DELETE FROM investment 
    WHERE investment_id = $1 
    RETURNING *
  `, [id]);
  return result.rows[0];
};

module.exports = { getAllInvestments, getInvestmentsByPortfolio, createInvestment, deleteInvestment };