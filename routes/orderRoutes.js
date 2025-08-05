const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new order
router.post('/', authMiddleware, orderController.createOrder);

// Get all orders
router.get('/', authMiddleware, orderController.getAllOrders);

// Get order by ID
router.get('/:id', authMiddleware, orderController.getOrderById);

// Get orders by customer ID
router.get('/customer/:customerId', authMiddleware, orderController.getOrdersByCustomer);

// Update order status
router.patch('/:id/status', authMiddleware, orderController.updateOrderStatus);

// Update order details
router.put('/:id', authMiddleware, orderController.updateOrder);

// Delete order
router.delete('/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;
