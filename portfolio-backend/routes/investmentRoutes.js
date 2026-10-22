const express = require('express');
const router  = express.Router();
const investmentController = require('../controllers/investmentController');

router.get('/portfolio/:portfolioId', investmentController.getInvestmentsByPortfolio);
router.get('/',                       investmentController.getAllInvestments);
router.post('/',                      investmentController.createInvestment);
router.delete('/:id',                  investmentController.deleteInvestment);

module.exports = router;