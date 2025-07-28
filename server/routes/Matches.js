const express = require('express');
const router = express.Router();
const controller = require('../controllers/MatchController');

router.get('/', controller.getMatchesByDate);

module.exports = router;
