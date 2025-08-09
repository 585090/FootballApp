const express = require('express');
const router = express.Router();
const controller = require('../controllers/TeamController');

router.get('/:competition', controller.getTeamsByCompetition);

module.exports = router;