const pool = require('../config/db');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const exportTransactionsCSV = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.transaction_id, 
        t.transaction_type AS type, 
        t.amount, 
        t.transaction_date,
        p.portfolio_name, 
        COALESCE(a.asset_name, 'N/A') AS asset_name,
        COALESCE(a.symbol, 'N/A') AS symbol
      FROM transactions t
      JOIN portfolio p ON t.portfolio_id = p.portfolio_id
      LEFT JOIN asset a ON t.asset_id = a.asset_id
      ORDER BY t.transaction_date DESC
      LIMIT 1000
    `);
    const parser = new Parser();
    const csv = parser.parse(result.rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'CSV export failed', error: err.message });
  }
};

const exportPortfolioPDF = async (req, res) => {
  const { id } = req.params;
  try {
    const portResult = await pool.query(
      'SELECT * FROM portfolio WHERE portfolio_id = $1', [id]
    );
    if (portResult.rows.length === 0) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    const portfolio = portResult.rows[0];

    const invResult = await pool.query(`
      SELECT i.quantity, i.purchase_price, a.asset_name, COALESCE(ac.class_name, 'N/A') AS asset_class
      FROM investment i 
      JOIN asset a ON i.asset_id = a.asset_id
      LEFT JOIN asset_class ac ON a.class_id = ac.class_id
      WHERE i.portfolio_id = $1
    `, [id]);
    const investments = invResult.rows;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=portfolio_${id}.pdf`);
    doc.pipe(res);

    doc.fontSize(22).fillColor('#1a1a2e').text('Portfolio Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Name: ${portfolio.portfolio_name}`);
    doc.text(`Total Value: $${Number(portfolio.total_value || 0).toLocaleString()}`);
    doc.text(`Created: ${new Date(portfolio.creation_date).toLocaleDateString()}`);
    doc.moveDown();
    doc.fontSize(16).text('Investments', { underline: true });
    doc.moveDown(0.5);

    if (investments.length === 0) {
      doc.fontSize(12).text('No investments recorded for this portfolio.');
    } else {
      investments.forEach((inv) => {
        doc.fontSize(12).text(
          `• ${inv.asset_name} (${inv.asset_class}) — Qty: ${inv.quantity} @ $${Number(inv.purchase_price).toLocaleString()}`
        );
      });
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ message: 'PDF export failed', error: err.message });
  }
};

module.exports = { exportTransactionsCSV, exportPortfolioPDF };