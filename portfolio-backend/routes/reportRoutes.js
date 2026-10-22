const express = require('express');
const router = express.Router();
const { exportTransactionsCSV, exportPortfolioPDF } = require('../reports/reportController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/transactions', verifyToken, exportTransactionsCSV);
router.get('/portfolio/:id', verifyToken, exportPortfolioPDF);

module.exports = router;