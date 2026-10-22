// models/marketModel.js
const pool = require('../config/db');

// Get all market data with asset details
const getAllMarketData = async () => {
  const result = await pool.query(`
    SELECT 
      md.market_id,
      md.current_price,
      md.current_price                              AS price,
      md.last_updated,
      md.last_updated                              AS updated_at,
      md.volatility,
      a.asset_name,
      a.asset_name                                  AS name,
      a.symbol,
      a.sector,
      ac.class_name,
      COALESCE(ac.class_name, 'Equity')             AS asset_class,
      ROUND(((md.volatility * 10) - 1.25)::numeric, 2) AS change_percent,
      FLOOR(md.current_price * 75 + 1000)::integer  AS volume
    FROM market_data md
    JOIN asset       a  ON md.asset_id = a.asset_id
    LEFT JOIN asset_class ac ON a.class_id = ac.class_id
    ORDER BY a.symbol
  `);
  return result.rows;
};

// Get market data for a specific asset
const getMarketDataByAsset = async (assetId) => {
  const result = await pool.query(`
    SELECT 
      md.market_id,
      md.current_price,
      md.current_price AS price,
      md.last_updated,
      md.last_updated AS updated_at,
      md.volatility,
      a.asset_name,
      a.asset_name AS name,
      a.symbol,
      a.sector
    FROM market_data md
    JOIN asset a ON md.asset_id = a.asset_id
    WHERE md.asset_id = $1
  `, [assetId]);
  return result.rows[0];
};

// Upsert market data (insert or update if asset already has data)
const upsertMarketData = async ({ current_price, price, volatility, asset_id }) => {
  const finalPrice = current_price || price;
  const result = await pool.query(`
    INSERT INTO market_data (current_price, volatility, asset_id, last_updated)
    VALUES ($1, COALESCE($2, 0.15), $3, CURRENT_TIMESTAMP)
    ON CONFLICT (asset_id)
    DO UPDATE SET
      current_price = EXCLUDED.current_price,
      volatility    = COALESCE(EXCLUDED.volatility, market_data.volatility),
      last_updated  = CURRENT_TIMESTAMP
    RETURNING *, current_price AS price, last_updated AS updated_at
  `, [finalPrice, volatility, asset_id]);
  return result.rows[0];
};

module.exports = { getAllMarketData, getMarketDataByAsset, upsertMarketData };