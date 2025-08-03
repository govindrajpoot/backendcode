const Customer = require('../models/Customer');

exports.createCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, addresses } = req.body;

    if (!name || !email || !phone || !addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ status: false, message: 'Name, email, phone and at least one address are required' });
    }

    // Create new customer linked to userId
    const newCustomer = new Customer({
      userId,
      name,
      email,
      phone,
      addresses
    });

    await newCustomer.save();

    res.status(201).json({ status: true, message: 'Customer created successfully', customer: newCustomer });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', error: err.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const userId = req.user.id;
    const customers = await Customer.find({ userId });
    res.status(200).json({ status: true, customers });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', error: err.message });
  }
};
