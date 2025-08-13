const express = require('express');
const router = express.Router();
const controller = require('../controllers/MatchController');

router.get('/by-date', controller.getMatchesByDate);
router.get('/by-matchweek', controller.getMatchesByMatchweek)

module.exports = router;
