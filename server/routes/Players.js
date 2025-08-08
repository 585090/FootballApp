const express = require('express');
const router = express.Router();
const controller = require('../controllers/PlayerController');

router.get('/', controller.getAllPlayers);
router.get('/:id', controller.getPlayersByGroup);
router.post('/signup', controller.createPlayer);
router.post('/login', controller.loginPlayer)
router.put('/:id/score', controller.updatePlayerScore);
router.put('/:id/group', controller.updatePlayerGroups);
router.delete('/:id', controller.deletePlayer);

module.exports = router;
