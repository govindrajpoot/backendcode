const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const CustomerAddress = require('../models/CustomerAddress');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB limit for videos
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images and videos are allowed.'));
  }
}).fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]);

// Export the upload middleware
exports.upload = upload;

// Create bulk shipments for an order
exports.createBulkShipments = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Request Body:', req.body); // Debugging line
    const { orderId, customerId, shipments = [] } = req.body || {};

    // Validation
    if (!orderId && !customerId && (!shipments || shipments.length === 0)) {
        return res.status(400).json({
            status: false,
            message: 'At least one of orderId, customerId, or shipments array is required'
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
        dispatchAddress,
        receiverName,
        notes,
        images,
        video
      } = shipmentData;

      // Validation for each shipment
      if (!shippingAddress || !courierService || !shippingCost || !numberOfBoxes || !dispatchPersonName || !dispatchAddress || !receiverName) {
        return res.status(400).json({
          status: false,
          message: 'Each shipment must include shippingAddress, courierService, shippingCost, numberOfBoxes, dispatchPersonName, dispatchAddress, and receiverName'
        });
      }

      // Validate images and video
      if (images.length > 5) {
        return res.status(400).json({
          status: false,
          message: 'You can upload a maximum of 5 images.'
        });
      }

      if (video && video.size > 250 * 1024 * 1024) {
        return res.status(400).json({
          status: false,
          message: 'Video size must not exceed 250MB.'
        });
      }

      // Fetch complete address details
      const address = await CustomerAddress.findOne({ _id: shippingAddress, customerId });
      if (!address) {
        return res.status(404).json({
          status: false,
          message: `Shipping address ${shippingAddress} not found or not authorized`
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
        dispatchAddress,
        receiverName,
        notes,
        images, // Store image URLs
        videos: video ? [video.path] : [] // Store video URL
      });

      await shipment.save();
      
      // Populate for response
      await shipment.populate([
        { path: 'orderId', select: 'orderNumber totalAmount' },
        { path: 'customerId', select: 'name email phone' }
      ]);
      
      createdShipments.push(shipment);
    }

    res.status(201).json({
      status: true,
      message: 'Bulk shipments created successfully',
      count: createdShipments.length,
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
// Clean up unnecessary comments

// Get all shipments for an order
exports.getOrderShipments = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const shipments = await Shipment.find({ orderId, userId })
      .populate('orderId', 'orderNumber totalAmount')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      count: shipments.length,
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
