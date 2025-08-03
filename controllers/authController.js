const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { name, phone, email, password, userType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ status: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, phone, email, password: hashedPassword, userType });
    await newUser.save();

    res.status(201).json({ status: true, message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', error: err.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.status(200).json({ status: true, users });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ status: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email, userType: user.userType }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      status: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', error: err.message });
  }
};
