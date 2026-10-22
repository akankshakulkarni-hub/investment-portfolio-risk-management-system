const pool = require('../config/db');

const getAllInvestors = async () => {
  const result = await pool.query(`
    SELECT 
      i.investor_id,
      i.name,
      i.email,
      i.phone,
      i.risk_profile,
      r.risk_desc,
      i.created_at
    FROM investor i
    LEFT JOIN risk_profile r ON i.risk_profile = r.risk_profile
    ORDER BY i.investor_id
  `);
  return result.rows;
};

const getInvestorById = async (id) => {
  const result = await pool.query(`
    SELECT 
      i.investor_id,
      i.name,
      i.email,
      i.phone,
      i.risk_profile,
      r.risk_desc,
      i.created_at
    FROM investor i
    LEFT JOIN risk_profile r ON i.risk_profile = r.risk_profile
    WHERE i.investor_id = $1
  `, [id]);
  return result.rows[0]; 
};

const createInvestor = async ({ name, email, phone, risk_profile }) => {
  const result = await pool.query(`
    INSERT INTO investor (name, email, phone, risk_profile)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [name, email, phone, risk_profile]);
  return result.rows[0];
};

const updateInvestor = async (id, { name, email, phone, risk_profile }) => {
  const result = await pool.query(`
    UPDATE investor 
    SET name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        risk_profile = COALESCE($4, risk_profile)
    WHERE investor_id = $5
    RETURNING *
  `, [name, email, phone, risk_profile, id]);
  return result.rows[0];
};

const deleteInvestor = async (id) => {
  const result = await pool.query(`
    DELETE FROM investor 
    WHERE investor_id = $1 
    RETURNING *
  `, [id]);
  return result.rows[0];
};

const getInvestorsByRisk = async (risk) => {
  const result = await pool.query(`
    SELECT 
      i.investor_id,
      i.name,
      i.email,
      i.risk_profile,
      r.risk_desc
    FROM investor i
    LEFT JOIN risk_profile r ON i.risk_profile = r.risk_profile
    WHERE i.risk_profile = $1
    ORDER BY i.name
  `, [risk.toUpperCase()]);
  return result.rows;
};

module.exports = { 
  getAllInvestors, 
  getInvestorById, 
  createInvestor, 
  updateInvestor, 
  deleteInvestor, 
  getInvestorsByRisk 
};