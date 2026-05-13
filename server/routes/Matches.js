const express = require('express');
const router = express.Router();
const controller = require('../controllers/MatchController');

router.get('/by-date', controller.getMatchesByDate);
router.get('/by-matchweek', controller.getMatchesByMatchweek);
router.get('/by-stage', controller.getMatchesByStage);
router.get('/matchweek', controller.getCurrentMatchweek);
router.get('/next', controller.getNextMatch);
router.get('/upcoming', controller.getUpcomingMatches);
router.get('/:matchId', controller.getMatchById);
module.exports = router;
