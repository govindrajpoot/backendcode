const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const customerAddressController = require('../controllers/customerAddressController');
const verifyToken = require('../middleware/authMiddleware');

// Customer routes
router.post('/register', customerController.registerCustomer);
router.post('/login', customerController.loginCustomer);
router.get('/', verifyToken, customerController.getAllCustomers);
router.get('/:id', verifyToken, customerController.getCustomerById);
router.put('/:id', verifyToken, customerController.updateCustomer);
router.delete('/:id', verifyToken, customerController.deleteCustomer);

// Customer address routes
router.post('/:customerId/addresses', verifyToken, customerAddressController.addAddress);
router.get('/:customerId/addresses', verifyToken, customerAddressController.getCustomerAddresses);
router.get('/:customerId/addresses/:addressId', verifyToken, customerAddressController.getAddress);
router.put('/:customerId/addresses/:addressId', verifyToken, customerAddressController.updateAddress);
router.delete('/:customerId/addresses/:addressId', verifyToken, customerAddressController.deleteAddress);

module.exports = router;
