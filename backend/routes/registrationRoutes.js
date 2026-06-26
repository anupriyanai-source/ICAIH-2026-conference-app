const express = require('express');
const controller = require('../controllers/registrationController');
const registrationUpload = require('../middleware/registrationUpload');

const router = express.Router();

router.post('/', registrationUpload.single('paymentScreenshot'), controller.register);
router.get('/', controller.getAll);

module.exports = router;
