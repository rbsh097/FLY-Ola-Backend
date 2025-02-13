/// Backend/routes/paymentRoutes.js
const express = require('express');
const { initiatePayment, phonePeCallback } = require('../controllers/paymentController');

const router = express.Router();

// 1) Initiate Payment
router.post('/initiate', initiatePayment);

// 2) Handle callback
router.post('/callback', phonePeCallback);

module.exports = router;
