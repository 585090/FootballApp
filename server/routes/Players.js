const express = require('express');
const router = express.Router();
const controller = require('../controllers/PlayerController');
const { requireAuth } = require('../middleware/auth');

// Public
router.post('/signup', controller.createPlayer);
router.post('/login', controller.loginPlayer);

// Authenticated
router.get('/', requireAuth, controller.getAllPlayers);
router.get('/leaderboard', requireAuth, controller.getLeaderboard);
router.put('/profile', requireAuth, controller.updateProfile);
router.put('/password', requireAuth, controller.updatePassword);
router.get('/:id', requireAuth, controller.getPlayersByGroup);
router.delete('/:id', requireAuth, controller.deletePlayer);

module.exports = router;
