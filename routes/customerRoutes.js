const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers } = require('../controllers/customerController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, createCustomer);
router.get('/', verifyToken, getCustomers);

module.exports = router;
