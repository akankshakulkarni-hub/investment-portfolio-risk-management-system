const express = require('express');
const router = express.Router();

const {
  getAllInvestors,
  getInvestorById,
  createInvestor,
  updateInvestor,
  deleteInvestor
} = require('../controllers/investorController');

router.get('/', getAllInvestors);
router.get('/:id', getInvestorById);
router.post('/', createInvestor);
router.put('/:id', updateInvestor);
router.delete('/:id', deleteInvestor);

module.exports = router;