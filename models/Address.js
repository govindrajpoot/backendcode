const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  address: { type: String, required: true },
  address2: { type: String },
  address3: { type: String },
  address4: { type: String },
  address5: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
