const express = require('express');
const router = express.Router();
const controller = require('../controllers/GroupStandingPredictionController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', controller.list);
router.put('/', controller.upsert);
router.put('/bulk', controller.bulkUpsert);

module.exports = router;
