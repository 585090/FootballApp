const express = require('express');
const router = express.Router();
const controller = require('../controllers/StandingsController');

router.get('/:competition', controller.getStandingsByCompetition);

module.exports = router;
