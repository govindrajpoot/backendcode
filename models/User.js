const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  userType: { type: String, enum: ['admin', 'user'], default: 'user' }
});

module.exports = mongoose.model('User', userSchema, 'users');
