const marketModel = require('../models/marketModel');

const getAllMarketData = async (req, res) => {
  try {
    const data = await marketModel.getAllMarketData();
    res.json(data); // ✅ FIX
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
};

const getMarketDataByAsset = async (req, res) => {
  try {
    const data = await marketModel.getMarketDataByAsset(req.params.assetId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
};

const upsertMarketData = async (req, res) => {
  try {
    const data = await marketModel.upsertMarketData(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
};

module.exports = {
  getAllMarketData,
  getMarketDataByAsset,
  upsertMarketData
};