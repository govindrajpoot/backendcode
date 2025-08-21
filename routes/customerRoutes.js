const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const customerApiController = require('../controllers/customerApiController');
const customerAddressController = require('../controllers/customerAddressController');
const verifyToken = require('../middleware/authMiddleware');

// New Customer API routes
router.post('/add', verifyToken, customerApiController.addOrUpdateCustomer);
router.get('/:customerId/details', verifyToken, customerApiController.getCustomerDetails);
router.put('/:customerId/address/:addressId', verifyToken, customerApiController.updateCustomerAddress);
router.put('/:customerId', verifyToken, customerApiController.updateCustomerWithAddresses);

// Legacy customer routes (keep for backward compatibility)
router.post('/register', verifyToken, customerController.registerCustomer);
router.post('/login', customerController.loginCustomer);
router.get('/', verifyToken, customerController.getAllCustomers);
router.get('/:id', verifyToken, customerController.getCustomerById);
router.put('/:id', verifyToken, customerController.updateCustomer);
router.delete('/:id', verifyToken, customerController.deleteCustomer);

// Legacy customer address routes (keep for backward compatibility)
router.post('/:customerId/addresses', verifyToken, customerAddressController.addAddress);
router.get('/:customerId/addresses', verifyToken, customerAddressController.getCustomerAddresses);
router.get('/:customerId/addresses/:addressId', verifyToken, customerAddressController.getAddress);
router.put('/:customerId/addresses/:addressId', verifyToken, customerAddressController.updateAddress);
router.delete('/:customerId/addresses/:addressId', verifyToken, customerAddressController.deleteAddress);

module.exports = router;
