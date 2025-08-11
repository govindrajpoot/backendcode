const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerAddress',
    required: true
  },
  courierService: {
    type: String,
    required: true,
    enum: ['FedEx', 'DHL', 'UPS', 'Blue Dart', 'Delhivery', 'India Post', 'Other']
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0
  },
  numberOfBoxes: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  trackingLink: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  dispatchPersonName: {
    type: String,
    required: true
  },
  receiverName: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Dispatched', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  dispatchedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Auto-generate tracking number if not provided
shipmentSchema.pre('save', async function(next) {
  if (!this.trackingNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.trackingNumber = `TRK${timestamp.slice(-6)}${random}`;
  }
  next();
});

module.exports = mongoose.model('Shipment', shipmentSchema);
