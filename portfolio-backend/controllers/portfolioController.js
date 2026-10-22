const portfolioModel = require('../models/portfolioModel');

const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await portfolioModel.getAllPortfolios();
    res.json(portfolios);
  } catch (err) {
    console.error('getAllPortfolios error:', err.message);
    res.status(500).json({ message: 'Error fetching portfolios' });
  }
};

const getPortfolioById = async (req, res) => {
  try {
    const data = await portfolioModel.getPortfolioById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Portfolio not found' });
    res.json(data);
  } catch (err) {
    console.error('getPortfolioById error:', err.message);
    res.status(500).json({ message: 'Error fetching portfolio' });
  }
};

const createPortfolio = async (req, res) => {
  try {
    const portfolio = await portfolioModel.createPortfolio(req.body);
    res.status(201).json(portfolio);
  } catch (err) {
    console.error('createPortfolio error:', err.message);
    res.status(500).json({ message: 'Create failed' });
  }
};

const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await portfolioModel.updatePortfolio(id, req.body);
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });
    res.json(portfolio);
  } catch (err) {
    console.error('updatePortfolio error:', err.message);
    res.status(500).json({ message: 'Update failed' });
  }
};

const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await portfolioModel.deletePortfolio(id);
    if (!deleted) return res.status(404).json({ message: 'Portfolio not found' });
    res.json({ message: 'Deleted successfully', portfolio: deleted });
  } catch (err) {
    console.error('deletePortfolio error:', err.message);
    res.status(500).json({ message: 'Delete failed' });
  }
};

const getPortfolioPerformance = async (req, res) => {
  try {
    const data = await portfolioModel.getPortfolioPerformance(req.params.id);
    if (!data) return res.status(404).json({ message: 'Performance data not found' });
    res.json(data);
  } catch (err) {
    console.error('getPortfolioPerformance error:', err.message);
    res.status(500).json({ message: 'Error calculating performance' });
  }
};

const getAllPortfolioPerformance = async (req, res) => {
  try {
    const data = await portfolioModel.getAllPortfolioPerformance();
    res.json(data);
  } catch (err) {
    console.error('getAllPortfolioPerformance error:', err.message);
    res.status(500).json({ message: 'Error fetching performance' });
  }
};

module.exports = {
  getAllPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioPerformance,
  getAllPortfolioPerformance
};