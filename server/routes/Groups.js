const express = require('express');
const router = express.Router();
const controller = require('../controllers/GroupController');

router.get('/player/:email', controller.getGroupsByPlayerEmail);
router.get('/:id', controller.getGroupById);
router.post('/createGroup', controller.createGroup);
router.post('/:groupId/addPlayer', controller.addPlayerToGroup);

module.exports = router;
