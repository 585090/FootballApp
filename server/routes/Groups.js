const express = require('express');
const router = express.Router();
const controller = require('../controllers/GroupController');

router.get('/', controller.getAllGroups);
router.post('/createGroup', controller.createGroup);

module.exports = router;
