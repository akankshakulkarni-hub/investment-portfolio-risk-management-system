const express = require('express');
const router = express.Router();

const {
  getAllAssets,
  getAssetById,
  getAssetsGroupedByClass,
  createAsset,
  updateAsset,
  deleteAsset
} = require('../controllers/assetController');

router.get('/', getAllAssets);
router.get('/grouped', getAssetsGroupedByClass);
router.get('/:id', getAssetById);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

module.exports = router;