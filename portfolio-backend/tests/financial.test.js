const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../config/db');

describe('Phase 8: Financial Calculations & Mathematical Edge Cases', () => {

  let testInvestorId;
  let profitPortfolioId;
  let lossPortfolioId;
  let emptyPortfolioId;
  let assetHighVolId;
  let assetLowVolId;

  before(async () => {
    // 1. Setup Investor
    const invRes = await pool.query(`
      INSERT INTO investor (name, email, phone, risk_profile)
      VALUES ('Financial Math Test Investor', 'math_test_${Date.now()}@test.com', '1234567890', 'medium')
      RETURNING investor_id;
    `);
    testInvestorId = invRes.rows[0].investor_id;

    // 2. Setup Assets with defined volatilities and prices
    const a1 = await pool.query(`
      INSERT INTO asset (asset_name, symbol, sector, default_risk_level, class_id)
      VALUES ('Safe Gov Bond Fund', 'SGB${Date.now().toString().slice(-4)}', 'Fixed Income', 'low', 1)
      RETURNING asset_id;
    `);
    assetLowVolId = a1.rows[0].asset_id;
    await pool.query(`
      INSERT INTO market_data (current_price, volatility, asset_id, last_updated)
      VALUES (100.00, 0.10, $1, CURRENT_TIMESTAMP)
      ON CONFLICT (asset_id) DO UPDATE SET current_price = 100.00, volatility = 0.10;
    `, [assetLowVolId]);

    const a2 = await pool.query(`
      INSERT INTO asset (asset_name, symbol, sector, default_risk_level, class_id)
      VALUES ('High Growth Crypto', 'HGC${Date.now().toString().slice(-4)}', 'Crypto', 'high', 1)
      RETURNING asset_id;
    `);
    assetHighVolId = a2.rows[0].asset_id;
    await pool.query(`
      INSERT INTO market_data (current_price, volatility, asset_id, last_updated)
      VALUES (300.00, 0.85, $1, CURRENT_TIMESTAMP)
      ON CONFLICT (asset_id) DO UPDATE SET current_price = 300.00, volatility = 0.85;
    `, [assetHighVolId]);

    // 3. Portfolios
    const p1 = await pool.query(`
      INSERT INTO portfolio (portfolio_name, total_value, investor_id)
      VALUES ('Profitable Growth Portfolio', 0, $1) RETURNING portfolio_id;
    `, [testInvestorId]);
    profitPortfolioId = p1.rows[0].portfolio_id;

    const p2 = await pool.query(`
      INSERT INTO portfolio (portfolio_name, total_value, investor_id)
      VALUES ('Loss-Making Defensive Portfolio', 0, $1) RETURNING portfolio_id;
    `, [testInvestorId]);
    lossPortfolioId = p2.rows[0].portfolio_id;

    const p3 = await pool.query(`
      INSERT INTO portfolio (portfolio_name, total_value, investor_id)
      VALUES ('Empty Portfolio No Positions', 0, $1) RETURNING portfolio_id;
    `, [testInvestorId]);
    emptyPortfolioId = p3.rows[0].portfolio_id;

    // 4. Positions:
    // Profit Portfolio: Purchased 10 units of High Growth at $150 (Now at $300) -> 100% gain
    await pool.query(`
      INSERT INTO investment (quantity, purchase_price, portfolio_id, asset_id)
      VALUES (10.00, 150.00, $1, $2);
    `, [profitPortfolioId, assetHighVolId]);

    // Loss Portfolio: Purchased 10 units of High Growth at $400 (Now at $300) -> 25% loss
    await pool.query(`
      INSERT INTO investment (quantity, purchase_price, portfolio_id, asset_id)
      VALUES (10.00, 400.00, $1, $2);
    `, [lossPortfolioId, assetHighVolId]);
  });

  after(async () => {
    if (profitPortfolioId) {
      await pool.query('DELETE FROM investment WHERE portfolio_id = $1', [profitPortfolioId]);
      await pool.query('DELETE FROM portfolio WHERE portfolio_id = $1', [profitPortfolioId]);
    }
    if (lossPortfolioId) {
      await pool.query('DELETE FROM investment WHERE portfolio_id = $1', [lossPortfolioId]);
      await pool.query('DELETE FROM portfolio WHERE portfolio_id = $1', [lossPortfolioId]);
    }
    if (emptyPortfolioId) {
      await pool.query('DELETE FROM portfolio WHERE portfolio_id = $1', [emptyPortfolioId]);
    }
    if (assetLowVolId) {
      await pool.query('DELETE FROM market_data WHERE asset_id = $1', [assetLowVolId]);
      await pool.query('DELETE FROM asset WHERE asset_id = $1', [assetLowVolId]);
    }
    if (assetHighVolId) {
      await pool.query('DELETE FROM market_data WHERE asset_id = $1', [assetHighVolId]);
      await pool.query('DELETE FROM asset WHERE asset_id = $1', [assetHighVolId]);
    }
    if (testInvestorId) {
      await pool.query('DELETE FROM investor WHERE investor_id = $1', [testInvestorId]);
    }
    await pool.end();
  });

  test('Verify Positive Return (Profit) Formula', async () => {
    // Total Invested = 10 * 150 = 1500
    // Current Value = 10 * 300 = 3000
    // Gain = (3000 - 1500) / 1500 * 100 = +100.00%
    const res = await pool.query(`
      SELECT 
        SUM(inv.quantity * inv.purchase_price) AS total_invested,
        SUM(inv.quantity * md.current_price)   AS current_value,
        ROUND((SUM(inv.quantity * md.current_price) - SUM(inv.quantity * inv.purchase_price)) / NULLIF(SUM(inv.quantity * inv.purchase_price), 0) * 100, 2) AS return_pct
      FROM investment inv
      JOIN market_data md ON md.asset_id = inv.asset_id
      WHERE inv.portfolio_id = $1;
    `, [profitPortfolioId]);

    assert.equal(Number(res.rows[0].total_invested), 1500.00);
    assert.equal(Number(res.rows[0].current_value), 3000.00);
    assert.equal(Number(res.rows[0].return_pct), 100.00);
  });

  test('Verify Negative Return (Loss) Formula & Decimal Rounding', async () => {
    // Total Invested = 10 * 400 = 4000
    // Current Value = 10 * 300 = 3000
    // Loss = (3000 - 4000) / 4000 * 100 = -25.00%
    const res = await pool.query(`
      SELECT 
        SUM(inv.quantity * inv.purchase_price) AS total_invested,
        SUM(inv.quantity * md.current_price)   AS current_value,
        ROUND((SUM(inv.quantity * md.current_price) - SUM(inv.quantity * inv.purchase_price)) / NULLIF(SUM(inv.quantity * inv.purchase_price), 0) * 100, 2) AS return_pct
      FROM investment inv
      JOIN market_data md ON md.asset_id = inv.asset_id
      WHERE inv.portfolio_id = $1;
    `, [lossPortfolioId]);

    assert.equal(Number(res.rows[0].total_invested), 4000.00);
    assert.equal(Number(res.rows[0].current_value), 3000.00);
    assert.equal(Number(res.rows[0].return_pct), -25.00);
  });

  test('Verify Empty Portfolio and Zero Denominator Protection', async () => {
    const res = await pool.query(`
      SELECT 
        COALESCE(SUM(inv.quantity * inv.purchase_price), 0) AS total_invested,
        COALESCE(SUM(inv.quantity * md.current_price), 0)   AS current_value,
        ROUND((COALESCE(SUM(inv.quantity * md.current_price), 0) - COALESCE(SUM(inv.quantity * inv.purchase_price), 0)) / NULLIF(SUM(inv.quantity * inv.purchase_price), 0) * 100, 2) AS return_pct
      FROM portfolio p
      LEFT JOIN investment inv ON inv.portfolio_id = p.portfolio_id
      LEFT JOIN market_data md ON md.asset_id = inv.asset_id
      WHERE p.portfolio_id = $1
      GROUP BY p.portfolio_id;
    `, [emptyPortfolioId]);

    assert.equal(Number(res.rows[0].total_invested), 0);
    assert.equal(Number(res.rows[0].current_value), 0);
    assert.equal(res.rows[0].return_pct, null); // NULLIF prevents division by zero crash
  });

  test('Verify Weighted Risk Score Calculation & Categorization', async () => {
    // Project Report Section 8.4 Query 2:
    // Risk score = ROUND(SUM(md.volatility * (inv.quantity * md.current_price)) / NULLIF(SUM(inv.quantity * md.current_price), 0) * 10, 2)
    // For profitPortfolio: volatility is 0.85, so 0.85 * 10 = 8.50 -> 'High' category (> 6.5)
    const res = await pool.query(`
      SELECT 
        ROUND(SUM(md.volatility * (inv.quantity * md.current_price)) / NULLIF(SUM(inv.quantity * md.current_price), 0) * 10, 2) AS risk_score,
        CASE
          WHEN (SUM(md.volatility * (inv.quantity * md.current_price)) / NULLIF(SUM(inv.quantity * md.current_price), 0) * 10) <= 3.5 THEN 'Low'
          WHEN (SUM(md.volatility * (inv.quantity * md.current_price)) / NULLIF(SUM(inv.quantity * md.current_price), 0) * 10) <= 6.5 THEN 'Medium'
          ELSE 'High'
        END AS risk_category
      FROM investment inv
      JOIN market_data md ON md.asset_id = inv.asset_id
      WHERE inv.portfolio_id = $1;
    `, [profitPortfolioId]);

    assert.equal(Number(res.rows[0].risk_score), 8.50);
    assert.equal(res.rows[0].risk_category, 'High');
  });

});
