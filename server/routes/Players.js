const express = require('express');
const router = express.Router();
const controller = require('../controllers/PlayerController');

router.get('/', controller.getAllPlayers);
router.get('/:id', controller.getPlayersByGroup);
router.post('/signup', controller.createPlayer);
router.post('/login', controller.loginPlayer)
router.put('/score', controller.updatePlayerScore);
//router.put('/:id/group', controller.updatePlayerGroups);
router.delete('/:id', controller.deletePlayer);

module.exports = router;

https://footballapp-u80w.onrender.comapi/players/login
https://footballapp-u80w.onrender.com/api/players/login