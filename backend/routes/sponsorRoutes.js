const express = require('express');
const controller = require('../controllers/sponsorController');

const router = express.Router();
router.post('/', controller.submitInquiry);
router.get('/', controller.getAll);

module.exports = router;
