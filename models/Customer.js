const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

// Compound index to ensure email is unique per user
customerSchema.index({ email: 1, userId: 1 }, { unique: true });
customerSchema.index({ phone: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
