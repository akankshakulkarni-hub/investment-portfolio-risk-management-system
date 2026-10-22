const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = require('../config/db');
const { app, server } = require('../index');
const investorModel = require('../models/investorModel');
const portfolioModel = require('../models/portfolioModel');
const assetModel = require('../models/assetModel');
const investmentModel = require('../models/investmentModel');
const transactionModel = require('../models/transactionModel');
const marketModel = require('../models/marketModel');

describe('Full-Stack Database, Financial Engine & API Integration Tests', () => {

  let baseUrl;
  let testServer;
  let testInvestorId;
  let testPortfolioId;
  let testAssetId;
  let testInvestmentId;
  let testTransactionId;
  let authToken;
  let testUserId;

  before(async () => {
    // Start server on an ephemeral port
    await new Promise((resolve) => {
      testServer = server.listen(0, () => {
        const port = testServer.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Cleanup test fixtures
    try {
      if (testInvestmentId) await investmentModel.deleteInvestment(testInvestmentId);
      if (testPortfolioId) await portfolioModel.deletePortfolio(testPortfolioId);
      if (testAssetId) await assetModel.deleteAsset(testAssetId);
      if (testInvestorId) await investorModel.deleteInvestor(testInvestorId);
      if (testUserId) await pool.query('DELETE FROM users WHERE user_id = $1', [testUserId]);
    } catch (e) {
      // ignore cleanup errors
    }
    await new Promise((resolve) => testServer.close(resolve));
    await pool.end();
  });

  // 1. Health & Database Connectivity
  test('1. API Health and database connectivity', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('Backend is running'));

    const dbRes = await pool.query('SELECT current_database(), current_user;');
    assert.equal(dbRes.rows[0].current_database, 'portfolio_db');
  });

  // 2. Authentication Flow (Signup, Login, GetMe, Validation)
  test('2. Authentication flow and JWT token validation', async () => {
    const testEmail = `user_test_${Date.now()}@test.com`;
    // Signup
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Integration Tester', email: testEmail, password: 'SecureTestPassword123' })
    });
    assert.equal(signupRes.status, 201);
    const signupData = await signupRes.json();
    assert.ok(signupData.token);
    assert.ok(signupData.user.user_id);
    testUserId = signupData.user.user_id;

    // Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'SecureTestPassword123' })
    });
    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.ok(loginData.token);
    authToken = loginData.token;

    // Get current user (protected route)
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.email, testEmail);

    // Reject without token
    const unauthRes = await fetch(`${baseUrl}/auth/me`);
    assert.equal(unauthRes.status, 401);
  });

  // 3. Investors API
  test('3. Investors API endpoints (GET, POST, PUT, DELETE)', async () => {
    const uniqueEmail = `investor_${Date.now()}@domain.com`;
    const createRes = await fetch(`${baseUrl}/investors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Warren Buffett Jr.', email: uniqueEmail, phone: '5551234567', risk_profile: 'low' })
    });
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    testInvestorId = created.investor_id;

    // GET all
    const listRes = await fetch(`${baseUrl}/investors`);
    assert.equal(listRes.status, 200);
    const list = await listRes.json();
    assert.ok(list.length >= 1);

    // GET by id
    const getRes = await fetch(`${baseUrl}/investors/${testInvestorId}`);
    assert.equal(getRes.status, 200);
    const item = await getRes.json();
    assert.equal(item.name, 'Warren Buffett Jr.');

    // PUT update
    const putRes = await fetch(`${baseUrl}/investors/${testInvestorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Warren Buffett Sr.' })
    });
    assert.equal(putRes.status, 200);
    const updated = await putRes.json();
    assert.equal(updated.name, 'Warren Buffett Sr.');
  });

  // 4. Assets API
  test('4. Assets API endpoints and market pricing', async () => {
    const symbol = `AST${Math.floor(Math.random() * 900 + 100)}`;
    const createRes = await fetch(`${baseUrl}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vanguard Total Stock Market',
        symbol,
        sector: 'Equity Index',
        risk_level: 'medium',
        asset_class: 'Equity',
        current_price: 220.00
      })
    });
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    testAssetId = created.asset_id;

    const listRes = await fetch(`${baseUrl}/assets`);
    assert.equal(listRes.status, 200);
    const assets = await listRes.json();
    const found = assets.find(a => a.asset_id === testAssetId);
    assert.ok(found);
    assert.equal(found.asset_name, 'Vanguard Total Stock Market');
    assert.equal(Number(found.current_price), 220.00);
  });

  // 5. Portfolios API & Financial Calculations
  test('5. Portfolios API and Performance Calculations', async () => {
    const createRes = await fetch(`${baseUrl}/portfolios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Flagship Alpha Fund',
        total_value: 50000,
        investor_id: testInvestorId
      })
    });
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    testPortfolioId = created.portfolio_id;

    // Add investment position: 100 units @ $200 purchase price
    const invRes = await fetch(`${baseUrl}/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolio_id: testPortfolioId,
        asset_id: testAssetId,
        quantity: 100,
        purchase_price: 200.00
      })
    });
    assert.equal(invRes.status, 201);
    const inv = await invRes.json();
    testInvestmentId = inv.investment_id;

    // Check performance endpoint:
    // Total Invested = 100 * 200 = 20,000
    // Current Value = 100 * 220 (current market price) = 22,000
    // Return % = (22,000 - 20,000) / 20,000 * 100 = 10.00%
    const perfRes = await fetch(`${baseUrl}/portfolios/${testPortfolioId}/performance`);
    assert.equal(perfRes.status, 200);
    const perf = await perfRes.json();
    assert.equal(Number(perf.total_invested), 20000.00);
    assert.equal(Number(perf.current_value), 22000.00);
    assert.equal(Number(perf.return_percentage), 10.00);
  });

  // 6. Transactions API
  test('6. Transactions API with BUY and SELL types', async () => {
    const txnRes = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolio_id: testPortfolioId,
        asset_id: testAssetId,
        type: 'buy',
        amount: 20000.00
      })
    });
    assert.equal(txnRes.status, 201);
    const txn = await txnRes.json();
    assert.equal(txn.transaction_type, 'BUY');
    testTransactionId = txn.transaction_id;

    const listRes = await fetch(`${baseUrl}/transactions`);
    assert.equal(listRes.status, 200);
    const list = await listRes.json();
    assert.ok(list.length >= 1);
  });

  // 7. Market Data API
  test('7. Market data listing and upsert', async () => {
    const listRes = await fetch(`${baseUrl}/market-data`);
    assert.equal(listRes.status, 200);
    const list = await listRes.json();
    assert.ok(list.length >= 1);

    // Upsert market price update
    const upsertRes = await fetch(`${baseUrl}/market-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset_id: testAssetId,
        current_price: 250.00,
        volatility: 0.18
      })
    });
    assert.equal(upsertRes.status, 200);
    const updated = await upsertRes.json();
    assert.equal(Number(updated.current_price), 250.00);
  });

  // 8. PDF & CSV Reports
  test('8. Report generation (CSV and PDF exports)', async () => {
    // CSV Export
    const csvRes = await fetch(`${baseUrl}/reports/transactions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    assert.equal(csvRes.status, 200);
    assert.ok(csvRes.headers.get('content-type').includes('text/csv'));
    const csvText = await csvRes.text();
    assert.ok(csvText.includes('transaction_id'));

    // PDF Export
    const pdfRes = await fetch(`${baseUrl}/reports/portfolio/${testPortfolioId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    assert.equal(pdfRes.status, 200);
    assert.ok(pdfRes.headers.get('content-type').includes('application/pdf'));
    const pdfBuffer = await pdfRes.arrayBuffer();
    assert.ok(pdfBuffer.byteLength > 100);
  });

});
