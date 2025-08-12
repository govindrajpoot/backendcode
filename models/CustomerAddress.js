const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerAddressSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  addressName: { type: String, required: true },
  city: { type: String, required: true },
  pinCode: { type: String, required: true },
  state: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
  fullAddress: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CustomerAddress', customerAddressSchema);
