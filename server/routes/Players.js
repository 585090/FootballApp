const express = require('express');
const router = express.Router();
const controller = require('../controllers/PlayerController');

router.get('/', controller.getAllPlayers);
router.post('/signup', controller.createPlayer);
router.post('/login', controller.loginPlayer)
router.put('/:id', controller.updatePlayerScore);
router.delete('/:id', controller.deletePlayer);

module.exports = router;
