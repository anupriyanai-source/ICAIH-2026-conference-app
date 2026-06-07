const express = require('express');
const controller = require('../controllers/contactController');

const router = express.Router();
router.post('/', controller.sendMessage);
router.get('/', controller.getAll);

module.exports = router;
