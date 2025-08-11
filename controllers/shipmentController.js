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
      notes
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

    // Handle file uploads
    const images = req.files?.images ? req.files.images.map(file => file.path) : [];
    const videos = req.files?.videos ? req.files.videos.map(file => file.path) : [];

    // Create shipment
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
      images,
      videos,
      dispatchPersonName,
      receiverName,
      notes
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
    console.error('Get shipments error:', error);
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
    console.error('Get shipment error:', error);
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

    // Handle file uploads
    if (req.files?.images) {
      const newImages = req.files.images.map(file => file.path);
      updateData.images = [...(shipment.images || []), ...newImages];
    }

    if (req.files?.videos) {
      const newVideos = req.files.videos.map(file => file.path);
      updateData.videos = [...(shipment.videos || []), ...newVideos];
    }

    // Update status timestamps
    if (updateData.status === 'Dispatched' && !shipment.dispatchedAt) {
      updateData.dispatchedAt = new Date();
    }
    if (updateData.status === 'Delivered' && !shipment.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    Object.assign(shipment, updateData);
    await shipment.save();

    await shipment.populate([
      { path: 'orderId', select: 'orderNumber totalAmount' },
      { path: 'customerId', select: 'name email phone' },
      { path: 'shippingAddress', select: 'addressName fullAddress' }
    ]);

    res.status(200).json({
      status: true,
      message: 'Shipment updated successfully',
      shipment
    });

  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
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

    await Shipment.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: 'Shipment deleted successfully'
    });

  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get available courier services
exports.getCourierServices = async (req, res) => {
  try {
    const courierServices = [
      'FedEx',
      'DHL',
      'UPS',
      'Blue Dart',
      'Delhivery',
      'India Post',
      'Other'
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
