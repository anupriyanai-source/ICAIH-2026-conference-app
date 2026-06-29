const express = require('express');
const controller = require('../controllers/registrationController');

const router = express.Router();

router.post('/', controller.register);
router.get('/', controller.getAll);

module.exports = router;
