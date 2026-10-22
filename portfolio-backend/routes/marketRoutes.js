// routes/marketRoutes.js

const express = require('express');
const router  = express.Router();
const marketController = require('../controllers/marketController');

router.get('/asset/:assetId', marketController.getMarketDataByAsset);
router.get('/',               marketController.getAllMarketData);
router.post('/',              marketController.upsertMarketData);

module.exports = router;