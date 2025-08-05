const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerAddressSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  addressName: { type: String, required: true },
  fullAddress: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CustomerAddress', customerAddressSchema);
