const assetModel = require('../models/assetModel');

const getAllAssets = async (req, res) => {
  try {
    const assets = await assetModel.getAllAssets();
    res.json(assets);
  } catch (err) {
    console.error('getAllAssets error:', err.message);
    res.status(500).json({ message: 'Failed to fetch assets' });
  }
};

const getAssetById = async (req, res) => {
  try {
    const asset = await assetModel.getAssetById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    console.error('getAssetById error:', err.message);
    res.status(500).json({ message: 'Error fetching asset' });
  }
};

const getAssetsGroupedByClass = async (req, res) => {
  try {
    const data = await assetModel.getAssetsGroupedByClass();
    res.json(data);
  } catch (err) {
    console.error('getAssetsGroupedByClass error:', err.message);
    res.status(500).json({ message: 'Error fetching assets by class' });
  }
};

const createAsset = async (req, res) => {
  try {
    const asset = await assetModel.createAsset(req.body);
    res.status(201).json(asset);
  } catch (err) {
    console.error('createAsset error:', err.message);
    res.status(500).json({ message: 'Create failed' });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await assetModel.updateAsset(id, req.body);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    console.error('updateAsset error:', err.message);
    res.status(500).json({ message: 'Update failed' });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await assetModel.deleteAsset(id);
    if (!deleted) return res.status(404).json({ message: 'Asset not found' });
    res.json({ message: 'Deleted successfully', asset: deleted });
  } catch (err) {
    console.error('deleteAsset error:', err.message);
    res.status(500).json({ message: 'Delete failed' });
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  getAssetsGroupedByClass,
  createAsset,
  updateAsset,
  deleteAsset
};