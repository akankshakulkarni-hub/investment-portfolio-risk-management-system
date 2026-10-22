const investmentModel = require('../models/investmentModel');

const getAllInvestments = async (req, res) => {
  try {
    const investments = await investmentModel.getAllInvestments();
    res.json(investments);
  } catch (err) {
    console.error('getAllInvestments error:', err.message);
    res.status(500).json({ message: 'Error fetching investments' });
  }
};

const getInvestmentsByPortfolio = async (req, res) => {
  try {
    const data = await investmentModel.getInvestmentsByPortfolio(req.params.portfolioId);
    res.json(data);
  } catch (err) {
    console.error('getInvestmentsByPortfolio error:', err.message);
    res.status(500).json({ message: 'Error fetching investments' });
  }
};

const createInvestment = async (req, res) => {
  try {
    const inv = await investmentModel.createInvestment(req.body);
    res.status(201).json(inv);
  } catch (err) {
    console.error('createInvestment error:', err.message);
    res.status(500).json({ message: 'Create failed' });
  }
};

const deleteInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await investmentModel.deleteInvestment(id);
    if (!deleted) return res.status(404).json({ message: 'Investment not found' });
    res.json({ message: 'Deleted successfully', investment: deleted });
  } catch (err) {
    console.error('deleteInvestment error:', err.message);
    res.status(500).json({ message: 'Delete failed' });
  }
};

module.exports = {
  getAllInvestments,
  getInvestmentsByPortfolio,
  createInvestment,
  deleteInvestment
};