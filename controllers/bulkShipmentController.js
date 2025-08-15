const Shipment = require('../models/Shipment');
const Customer = require('../models/Customer');
const CustomerAddress = require('../models/CustomerAddress');
const Order = require('../models/Order');

// Create bulk shipments for single order to multiple addresses
exports.createBulkShipments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, customerId, shipments } = req.body;

    // Validation
    if (!orderId || !customerId || !shipments || !Array.isArray(shipments) || shipments.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Order ID, Customer ID, and shipments array are required'
      });
    }

    // Verify order belongs to user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found or not authorized'
      });
    }

    // Verify customer belongs to user
    const customer = await Customer.findOne({ _id: customerId, userId });
    if (!customer) {
      return res.status(404).json({
        status: false,
        message: 'Customer not found or not authorized'
      });
    }

    // Process each shipment
    const createdShipments = [];
    
    for (const shipmentData of shipments) {
      const {
        shippingAddress,
        courierService,
        shippingCost,
        numberOfBoxes,
        trackingNumber,
        trackingLink,
        dispatchPersonName,
        receiverName,
        notes,
        quantity // Quantity of items for this address
      } = shipmentData;

      // Verify shipping address belongs to customer
      const address = await CustomerAddress.findOne({ _id: shippingAddress, customerId });
      if (!address) {
        return res.status(404).json({
          status: false,
          message: `Shipping address ${shippingAddress} not found or not authorized`
        });
      }

      // Create individual shipment
      const shipment = new Shipment({
        orderId,
        customerId,
        userId,
        shippingAddress,
        courierService,
        shippingCost,
        numberOfBoxes,
        trackingNumber,
        trackingLink,
        dispatchPersonName,
        receiverName,
        notes,
        quantity: quantity || 1
      });

      await shipment.save();
      
      // Populate related data
      await shipment.populate([
        { path: 'orderId', select: 'orderNumber totalAmount' },
        { path: 'customerId', select: 'name email phone' },
        { path: 'shippingAddress', select: 'addressName fullAddress' }
      ]);

      createdShipments.push(shipment);
    }

    res.status(201).json({
      status: true,
      message: `${createdShipments.length} shipments created successfully`,
      orderId,
      totalShipments: createdShipments.length,
      shipments: createdShipments
    });

  } catch (error) {
    console.error('Create bulk shipments error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error during bulk shipment creation',
      error: error.message
    });
  }
};

// Get all shipments for a specific order
exports.getOrderShipments = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Verify order belongs to user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found or not authorized'
      });
    }

    const shipments = await Shipment.find({ orderId, userId })
      .populate('customerId', 'name email phone')
      .populate('shippingAddress', 'addressName fullAddress')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      count: shipments.length,
      orderId,
      shipments
    });

  } catch (error) {
    console.error('Get order shipments error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message
    });
  }
};
