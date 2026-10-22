const transactionModel = require('../models/transactionModel');

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel.getAllTransactions();
    res.json(transactions); // ✅ FIX
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

const getTransactionsByPortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const data = await transactionModel.getTransactionsByPortfolio(portfolioId);
    res.json(data); // ✅ FIX
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const newTransaction = await transactionModel.createTransaction(req.body);
    res.status(201).json(newTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Create failed' });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionsByPortfolio,
  createTransaction
};