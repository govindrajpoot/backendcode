const Customer = require('../models/Customer');
const CustomerAddress = require('../models/CustomerAddress');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new customer (user-specific)
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, addresses } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        status: false, 
        message: 'Name, email, phone and password are required' 
      });
    }

    // Check if email already exists for this user
    const existingEmail = await Customer.findOne({ email, userId });
    if (existingEmail) {
      return res.status(409).json({ 
        status: false, 
        message: 'Email already registered for this user' 
      });
    }

    // Check if phone already exists for this user
    const existingPhone = await Customer.findOne({ phone, userId });
    if (existingPhone) {
      return res.status(409).json({ 
        status: false, 
        message: 'Phone number already registered for this user' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new customer with user association
    const newCustomer = new Customer({
      name,
      email,
      phone,
      password: hashedPassword,
      userId
    });

    await newCustomer.save();

    // Save addresses separately in CustomerAddress collection
    const savedAddresses = [];
    if (addresses && Array.isArray(addresses)) {
      for (const addr of addresses) {
        const { addressName, fullAddress } = addr;
        if (addressName && fullAddress) {
          const newAddress = new CustomerAddress({
            customerId: newCustomer._id,
            addressName,
            fullAddress
          });
          const savedAddress = await newAddress.save();
          savedAddresses.push(savedAddress);
        }
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { customerId: newCustomer._id, email: newCustomer.email, userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      status: true, 
      message: 'Customer registered successfully', 
      customer: {
        id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        userId: newCustomer.userId
      },
      addresses: savedAddresses,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
};

// Get all customers for the authenticated user
exports.getAllCustomers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const customers = await Customer.find({ userId }).select('-password');
    res.status(200).json({ 
      status: true, 
      count: customers.length,
      customers 
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get customer by ID (user-specific)
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const customer = await Customer.findOne({ _id: id, userId }).select('-password');
    if (!customer) {
      return res.status(404).json({ 
        status: false, 
        message: 'Customer not found or not authorized' 
      });
    }

    // Get customer addresses
    const addresses = await CustomerAddress.find({ customerId: id });

    res.status(200).json({ 
      status: true, 
      customer,
      addresses 
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update customer (user-specific)
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    // Check if customer exists and belongs to user
    const customer = await Customer.findOne({ _id: id, userId });
    if (!customer) {
      return res.status(404).json({ 
        status: false, 
        message: 'Customer not found or not authorized' 
      });
    }

    // Check if email already exists for this user (excluding current customer)
    if (email && email !== customer.email) {
      const existingEmail = await Customer.findOne({ email, userId, _id: { $ne: id } });
      if (existingEmail) {
        return res.status(409).json({ 
          status: false, 
          message: 'Email already exists for this user' 
        });
      }
    }

    // Check if phone already exists for this user (excluding current customer)
    if (phone && phone !== customer.phone) {
      const existingPhone = await Customer.findOne({ phone, userId, _id: { $ne: id } });
      if (existingPhone) {
        return res.status(409).json({ 
          status: false, 
          message: 'Phone number already exists for this user' 
        });
      }
    }

    // Update fields if provided
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;

    await customer.save();

    res.status(200).json({ 
      status: true, 
      message: 'Customer updated successfully', 
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        userId: customer.userId
      }
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete customer (user-specific)
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const customer = await Customer.findOne({ _id: id, userId });
    if (!customer) {
      return res.status(404).json({ 
        status: false, 
        message: 'Customer not found or not authorized' 
      });
    }

    // Delete customer and related addresses
    await Customer.findByIdAndDelete(id);
    await CustomerAddress.deleteMany({ customerId: id });

    res.status(200).json({ 
      status: true, 
      message: 'Customer and related data deleted successfully' 
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Login customer
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        status: false, 
        message: 'Email and password are required' 
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ 
        status: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ 
        status: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { customerId: customer._id, email: customer.email, userId: customer.userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      status: true, 
      message: 'Login successful', 
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        userId: customer.userId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Server error during login', 
      error: error.message 
    });
  }
};
