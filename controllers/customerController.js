const Customer = require('../models/Customer');
const CustomerAddress = require('../models/CustomerAddress');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new customer
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, addresses } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        status: false, 
        message: 'Name, email, phone and password are required' 
      });
    }

    // Check if email already exists
    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ 
        status: false, 
        message: 'Email already registered' 
      });
    }

    // Check if phone already exists
    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ 
        status: false, 
        message: 'Phone number already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new customer
    const newCustomer = new Customer({
      name,
      email,
      phone,
      password: hashedPassword
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
      { customerId: newCustomer._id, email: newCustomer.email },
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
        phone: newCustomer.phone
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
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { customerId: customer._id, email: customer.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      status: true, 
      message: 'Login successful', 
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      token
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

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password');
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

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id).select('-password');
    if (!customer) {
      return res.status(404).json({ 
        status: false, 
        message: 'Customer not found' 
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

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    // Check if customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ 
        status: false, 
        message: 'Customer not found' 
      });
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
        phone: customer.phone
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

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ 
        status: false, 
        message: 'Customer not found' 
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
