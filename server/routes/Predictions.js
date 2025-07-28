const express = require('express');
const router = express.Router();
const controller = require('../controllers/PredictionController');

router.get('/', controller.getPrediction);
router.post('/predict', controller.makePrediction);

module.exports = router;
