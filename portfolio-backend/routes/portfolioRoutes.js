const express = require('express');
const router = express.Router();

const {
  getAllPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioPerformance,
  getAllPortfolioPerformance
} = require('../controllers/portfolioController');

router.get('/', getAllPortfolios);
router.get('/performance', getAllPortfolioPerformance);
router.get('/:id', getPortfolioById);
router.get('/:id/performance', getPortfolioPerformance);
router.post('/', createPortfolio);
router.put('/:id', updatePortfolio);
router.delete('/:id', deletePortfolio);

module.exports = router;