const express = require('express');
const router = express.Router();
const controller = require('../controllers/PredictionController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', controller.getPrediction);
router.get('/history', controller.getPredictionHistory);
router.post('/predict', controller.makePrediction);
router.get('/match/:matchId', controller.getPredictionsForMatch);
router.get('/predictTable', controller.getPredictionTable);
router.post('/predictTable', controller.storePlayersPredictionTable);
module.exports = router;
