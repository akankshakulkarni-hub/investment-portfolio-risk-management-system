// models/assetModel.js
const pool = require('../config/db');

// Get all assets
const getAllAssets = async () => {
  const result = await pool.query(`
    SELECT 
      a.asset_id,
      a.asset_name,
      a.asset_name                                            AS name,
      a.symbol,
      a.sector,
      a.default_risk_level,
      COALESCE(a.default_risk_level, ac.risk_level, 'medium') AS risk_level,
      a.class_id,
      ac.class_name,
      COALESCE(ac.class_name, 'Equity')                       AS asset_class,
      ac.risk_level                                           AS class_risk_level,
      COALESCE(md.current_price, 0)                           AS current_price
    FROM asset a
    LEFT JOIN asset_class ac ON a.class_id = ac.class_id
    LEFT JOIN market_data md ON md.asset_id = a.asset_id
    ORDER BY a.asset_id
  `);
  return result.rows;
};

// Get single asset by ID
const getAssetById = async (id) => {
  const result = await pool.query(`
    SELECT 
      a.asset_id,
      a.asset_name,
      a.asset_name                                            AS name,
      a.symbol,
      a.sector,
      a.default_risk_level,
      COALESCE(a.default_risk_level, ac.risk_level, 'medium') AS risk_level,
      ac.class_name,
      COALESCE(ac.class_name, 'Equity')                       AS asset_class,
      ac.risk_level                                           AS class_risk_level,
      COALESCE(md.current_price, 0)                           AS current_price
    FROM asset a
    LEFT JOIN asset_class ac ON a.class_id = ac.class_id
    LEFT JOIN market_data md ON md.asset_id = a.asset_id
    WHERE a.asset_id = $1
  `, [id]);
  return result.rows[0];
};

// Get assets grouped by class
const getAssetsGroupedByClass = async () => {
  const result = await pool.query(`
    SELECT 
      ac.class_name,
      ac.risk_level,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'asset_id',           a.asset_id,
          'asset_name',         a.asset_name,
          'name',               a.asset_name,
          'symbol',             a.symbol,
          'sector',             a.sector,
          'default_risk_level', a.default_risk_level,
          'current_price',      COALESCE(md.current_price, 0)
        ) ORDER BY a.asset_name
      ) AS assets
    FROM asset_class ac
    LEFT JOIN asset a ON a.class_id = ac.class_id
    LEFT JOIN market_data md ON md.asset_id = a.asset_id
    GROUP BY ac.class_id, ac.class_name, ac.risk_level
    ORDER BY ac.class_name
  `);
  return result.rows;
};

// Create new asset
const createAsset = async ({ asset_name, name, symbol, sector, default_risk_level, risk_level, class_id, asset_class, current_price }) => {
  const finalName = asset_name || name;
  const finalSymbol = symbol || (finalName ? finalName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) : 'ASSET');
  const finalSector = sector || 'Financial Services';
  const finalRisk = default_risk_level || risk_level || 'medium';
  
  let resolvedClassId = class_id;
  if (!resolvedClassId && asset_class) {
    const classRes = await pool.query('SELECT class_id FROM asset_class WHERE LOWER(class_name) = LOWER($1)', [asset_class]);
    if (classRes.rows.length > 0) resolvedClassId = classRes.rows[0].class_id;
  }
  if (!resolvedClassId) {
    const defaultClass = await pool.query('SELECT class_id FROM asset_class LIMIT 1');
    resolvedClassId = defaultClass.rows[0]?.class_id || 1;
  }

  const result = await pool.query(`
    INSERT INTO asset (asset_name, symbol, sector, default_risk_level, class_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *, asset_name AS name
  `, [finalName, finalSymbol, finalSector, finalRisk, resolvedClassId]);
  const newAsset = result.rows[0];

  if (current_price) {
    await pool.query(`
      INSERT INTO market_data (current_price, volatility, asset_id, last_updated)
      VALUES ($1, 0.15, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (asset_id) DO UPDATE SET current_price = EXCLUDED.current_price
    `, [current_price, newAsset.asset_id]);
  }

  return newAsset;
};

// Update asset
const updateAsset = async (id, { asset_name, name, symbol, sector, default_risk_level, risk_level, class_id, current_price }) => {
  const finalName = asset_name || name;
  const finalRisk = default_risk_level || risk_level;
  const result = await pool.query(`
    UPDATE asset
    SET asset_name = COALESCE($1, asset_name),
        symbol = COALESCE($2, symbol),
        sector = COALESCE($3, sector),
        default_risk_level = COALESCE($4, default_risk_level),
        class_id = COALESCE($5, class_id)
    WHERE asset_id = $6
    RETURNING *, asset_name AS name
  `, [finalName, symbol, sector, finalRisk, class_id, id]);

  if (current_price) {
    await pool.query(`
      INSERT INTO market_data (current_price, volatility, asset_id, last_updated)
      VALUES ($1, 0.15, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (asset_id) DO UPDATE SET current_price = EXCLUDED.current_price
    `, [current_price, id]);
  }

  return result.rows[0];
};

// Delete asset
const deleteAsset = async (id) => {
  await pool.query('DELETE FROM market_data WHERE asset_id = $1', [id]);
  await pool.query('DELETE FROM investment WHERE asset_id = $1', [id]);
  await pool.query('DELETE FROM transactions WHERE asset_id = $1', [id]);
  const result = await pool.query('DELETE FROM asset WHERE asset_id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = { 
  getAllAssets, 
  getAssetById, 
  getAssetsGroupedByClass, 
  createAsset, 
  updateAsset,
  deleteAsset 
};