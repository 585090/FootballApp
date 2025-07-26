const express = require('express');
const router = express.Router();
const controller = require('../controllers/PlayerController');

router.get('/', controller.getAllPlayers);
router.post('/', controller.createPlayer);
router.put('/:id', controller.updatePlayerScore);
router.delete('/:id', controller.deletePlayer);

module.exports = router;

export default router;