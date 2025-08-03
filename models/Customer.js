const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  address: { type: String, required: true },
  address2: { type: String },
  address3: { type: String },
  address4: { type: String },
  address5: { type: String }
});

const customerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  addresses: [addressSchema]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
