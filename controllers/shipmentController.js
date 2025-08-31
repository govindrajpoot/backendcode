const Shipment = require('../models/Shipment');
const Customer = require('../models/Customer');
const CustomerAddress = require('../models/CustomerAddress');
const Order = require('../models/Order');

// Create new shipment
exports.createShipment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      orderId,
      customerId,
      shippingAddress,
      courierService,
      shippingCost,
      numberOfBoxes,
      trackingNumber,
      trackingLink,
      dispatchPersonName,
      receiverName,
      notes,
      images = [], // Add images field to accept image URLs
      videos = [] // Add videos field to accept video URLs
    } = req.body;

    // Validation
    if (!orderId || !customerId || !shippingAddress || !courierService || !shippingCost || !numberOfBoxes || !dispatchPersonName || !receiverName) {
      return res.status(400).json({
        status: false,
        message: 'Missing required fields'
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

    // Verify shipping address belongs to customer
    const address = await CustomerAddress.findOne({ _id: shippingAddress, customerId });
    if (!address) {
      return res.status(404).json({
        status: false,
        message: 'Shipping address not found or not authorized'
      });
    }

    // Validate images if provided
    if (images && !Array.isArray(images)) {
      return res.status(400).json({
        status: false,
        message: 'Images must be an array of URLs'
      });
    }

    // Validate videos if provided
    if (videos && !Array.isArray(videos)) {
      return res.status(400).json({
        status: false,
        message: 'Videos must be an array of URLs'
      });
    }

    // Create shipment with complete address details
    const shipment = new Shipment({
      orderId,
      customerId,
      userId,
      shippingAddress,
      shippingAddressDetails: {
        addressLine: address.addressName,
        city: address.city,
        pinCode: address.pinCode,
        state: address.state,
        fullAddress: address.fullAddress
      },
      courierService,
      shippingCost,
      numberOfBoxes,
      trackingNumber,
      trackingLink,
      dispatchPersonName,
      receiverName,
      notes,
      images, // Store image URLs
      videos // Store video URLs
    });

    await shipment.save();

    // Populate related data
    await shipment.populate([
      { path: 'orderId', select: 'orderNumber totalAmount' },
      { path: 'customerId', select: 'name email phone' },
      { path: 'shippingAddress', select: 'addressName fullAddress' }
    ]);

    res.status(201).json({
      status: true,
      message: 'Shipment created successfully',
      shipment
    });

  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error during shipment creation',
      error: error.message
    });
  }
};

// Update shipment by orderId and shipmentId
exports.updateShipmentByOrderIdAndShipmentId = async (req, res) => {
  try {
    const { orderId, shipmentId } = req.params;
    const updateData = req.body;

    // Find the shipment
    const shipment = await Shipment.findOne({ _id: shipmentId, orderId });
    if (!shipment) {
      return res.status(404).json({
        status: false,
        message: 'Shipment not found or does not belong to this order'
      });
    }

    // Update shipment details
    Object.assign(shipment, updateData);
    await shipment.save();

    res.status(200).json({
      status: true,
      message: 'Shipment updated successfully',
      shipment
    });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error during shipment update',
      error: error.message
    });
  }
};

// Get all shipments for user
exports.getAllShipments = async (req, res) => {
  try {
    const userId = req.user.id;
    const shipments = await Shipment.find({ userId })
      .populate('orderId', 'orderNumber totalAmount')
      .populate('customerId', 'name email phone')
      .populate('shippingAddress', 'addressName fullAddress')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      count: shipments.length,
      shipments
    });
  } catch (error) {
    console.error('Get all shipments error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get courier services
exports.getCourierServices = async (req, res) => {
  try {
    const courierServices = [
      'FedEx',
      'UPS',
      'DHL',
      'USPS',
      'Blue Dart',
      'DTDC',
      'Delhivery',
      'Ecom Express',
      'XpressBees'
    ];

    res.status(200).json({
      status: true,
      courierServices
    });
  } catch (error) {
    console.error('Get courier services error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get shipment by ID
exports.getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const shipment = await Shipment.findOne({ _id: id, userId })
      .populate('orderId', 'orderNumber totalAmount')
      .populate('customerId', 'name email phone')
      .populate('shippingAddress', 'addressName fullAddress');

    if (!shipment) {
      return res.status(404).json({
        status: false,
        message: 'Shipment not found or not authorized'
      });
    }

    res.status(200).json({
      status: true,
      shipment
    });
  } catch (error) {
    console.error('Get shipment by ID error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update shipment
exports.updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const shipment = await Shipment.findOne({ _id: id, userId });
    if (!shipment) {
      return res.status(404).json({
        status: false,
        message: 'Shipment not found or not authorized'
      });
    }

    Object.assign(shipment, updateData);
    await shipment.save();

    res.status(200).json({
      status: true,
      message: 'Shipment updated successfully',
      shipment
    });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error during shipment update',
      error: error.message
    });
  }
};

// Delete shipment
exports.deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const shipment = await Shipment.findOne({ _id: id, userId });
    if (!shipment) {
      return res.status(404).json({
        status: false,
        message: 'Shipment not found or not authorized'
      });
    }

    await Shipment.deleteOne({ _id: id });

    res.status(200).json({
      status: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error during shipment deletion',
      error: error.message
    });
  }
};

