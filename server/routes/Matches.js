const express = require('express');
const router = express.Router();
const controller = require('../controllers/MatchController');

router.get('/by-date', controller.getMatchesByDate);

module.exports = router;
