const investorModel = require('../models/investorModel');

const getAllInvestors = async (req, res) => {
  try {
    const investors = await investorModel.getAllInvestors();
    res.json(investors);
  } catch (err) {
    console.error('getAllInvestors error:', err.message);
    res.status(500).json({ message: 'Failed to fetch investors' });
  }
};

const getInvestorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid investor ID' });

    const investor = await investorModel.getInvestorById(id);
    if (!investor) return res.status(404).json({ message: 'Investor not found' });

    res.json(investor);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const createInvestor = async (req, res) => {
  try {
    const { name, email, phone, risk_profile } = req.body;

    if (!name || !email || !risk_profile) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const newInvestor = await investorModel.createInvestor({
      name,
      email,
      phone,
      risk_profile: risk_profile.toLowerCase()
    });

    res.status(201).json(newInvestor);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const updateInvestor = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await investorModel.updateInvestor(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Investor not found' });
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Update failed' });
  }
};

const deleteInvestor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await investorModel.deleteInvestor(id);
    if (!deleted) return res.status(404).json({ message: 'Investor not found' });
    res.json({ message: 'Deleted successfully', investor: deleted });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Delete failed' });
  }
};

module.exports = {
  getAllInvestors,
  getInvestorById,
  createInvestor,
  updateInvestor,
  deleteInvestor
};