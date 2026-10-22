// routes/transactionRoutes.js

const express = require('express');
const router  = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/portfolio/:portfolioId', transactionController.getTransactionsByPortfolio);
router.get('/',                       transactionController.getAllTransactions);
router.post('/',                      transactionController.createTransaction);

module.exports = router;