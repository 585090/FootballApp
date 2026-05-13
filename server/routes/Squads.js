const express = require('express');
const router = express.Router();
const controller = require('../controllers/SquadController');

router.get('/team/:teamId', controller.getSquadByTeam);

module.exports = router;
