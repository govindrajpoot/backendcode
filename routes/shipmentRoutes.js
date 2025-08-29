const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const bulkShipmentController = require('../controllers/bulkShipmentController');
const verifyToken = require('../middleware/authMiddleware');

// Shipment routes
router.post('/', verifyToken, shipmentController.createShipment);
router.post('/bulk', verifyToken, bulkShipmentController.upload, bulkShipmentController.createBulkShipments);
router.get('/order/:orderId', verifyToken, bulkShipmentController.getOrderShipments);
router.get('/', verifyToken, shipmentController.getAllShipments);
router.get('/courier-services', verifyToken, shipmentController.getCourierServices);
router.get('/:id', verifyToken, shipmentController.getShipmentById);
router.put('/:id', verifyToken, shipmentController.updateShipment);
router.put('/:orderId/:shipmentId', verifyToken, shipmentController.updateShipmentByOrderIdAndShipmentId);
router.delete('/:id', verifyToken, shipmentController.deleteShipment);

module.exports = router;
 