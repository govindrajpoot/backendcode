const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
  orderNumber: {
    type: String,
    required: false // optional but useful for search
  },
  productInformation: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    min: 1
  },
  numberOfBoxes: {
    type: Number,
    min: 1
  },
  orderDate: {
    type: String,
    required: true,
    match: [/^\d{2}-\d{2}-\d{4}$/, 'Please enter date in DD-MM-YYYY format']
  },
  weight: {
    type: Number,
    min: 0.1
  },
  orderValue: {
    type: Number,
    min: 0
  },
  productDescription: {
    type: String
  },
  dimensions: {
    length: {
      type: Number,
      min: 0.1
    },
    width: {
      type: Number,
      min: 0.1
    },
    height: {
      type: Number,
      min: 0.1
    }
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
