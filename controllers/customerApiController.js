const Customer = require('../models/Customer');
const CustomerAddress = require('../models/CustomerAddress');

// Add or update customer with address
const addOrUpdateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        status: false,
        message: 'Name and phone are required'
      });
    }

    // Check if customer exists with same name, email, phone for this user
    let customer = await Customer.findOne({
      userId,
      $or: [
        { name: name.trim() },
        { email: email?.trim() || '' },
        { phone: phone.trim() }
      ]
    });

    if (!customer) {
      // Create new customer
      customer = new Customer({
        name: name.trim(),
        email: email?.trim() || '',
        phone: phone.trim(),
        password: 'default123',
        userId
      });
      await customer.save();
    }

    // Process addresses
    const savedAddresses = [];
    
    if (address && Array.isArray(address)) {
      for (const addr of address) {
        const {
          addressLine,
          city,
          pinCode,
          state,
          primary
        } = addr;

        if (addressLine && city && pinCode && state) {
          // Check if this exact address already exists for this customer
          const existingAddress = await CustomerAddress.findOne({
            customerId: customer._id,
            addressName: addressLine.trim(),
            city: city.trim(),
            pinCode: pinCode.trim(),
            state: state.trim()
          });

          if (existingAddress) {
            // Update existing address if primary flag changed
            if (primary !== undefined) {
              if (primary === true) {
                // Set all other addresses as non-primary
                await CustomerAddress.updateMany(
                  { customerId: customer._id },
                  { $set: { isPrimary: false } }
                );
              }
              existingAddress.isPrimary = primary;
              await existingAddress.save();
            }
            savedAddresses.push(existingAddress);
          } else {
            // Create new address
            if (primary === true) {
              // Set all other addresses as non-primary
              await CustomerAddress.updateMany(
                { customerId: customer._id },
                { $set: { isPrimary: false } }
              );
            }

            const newAddress = new CustomerAddress({
              customerId: customer._id,
              addressName: addressLine.trim(),
              city: city.trim(),
              pinCode: pinCode.trim(),
              state: state.trim(),
              isPrimary: primary || false,
              fullAddress: `${addressLine.trim()}, ${city.trim()}, ${state.trim()} - ${pinCode.trim()}`
            });

            await newAddress.save();
            savedAddresses.push(newAddress);
          }
        }
      }
    }

    res.status(200).json({
      status: true,
      message: 'Customer processed successfully',
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      addresses: savedAddresses.map(addr => ({
        id: addr._id,
        addressLine: addr.addressName,
        city: addr.city,
        pinCode: addr.pinCode,
        state: addr.state,
        primary: addr.isPrimary
      }))
    });

  } catch (error) {
    console.error('Add/Update customer error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get customer details with all addresses
const getCustomerDetails = async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user.id;

    const customer = await Customer.findOne({ _id: customerId, userId });
    if (!customer) {
      return res.status(404).json({
        status: false,
        message: 'Customer not found or not authorized'
      });
    }

    const addresses = await CustomerAddress.find({ customerId }).sort({ isPrimary: -1 });

    res.status(200).json({
      status: true,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      addresses: addresses.map(addr => ({
        id: addr._id,
        addressLine: addr.addressName,
        city: addr.city,
        pinCode: addr.pinCode,
        state: addr.state,
        primary: addr.isPrimary
      }))
    });

  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update specific address for a customer
const updateCustomerAddress = async (req, res) => {
  try {
    const { customerId, addressId } = req.params;
    const { addressLine, city, pinCode, state, primary } = req.body;
    const userId = req.user.id;

    // Verify customer belongs to user
    const customer = await Customer.findOne({ _id: customerId, userId });
    if (!customer) {
      return res.status(404).json({
        status: false,
        message: 'Customer not found or not authorized'
      });
    }

    // Find the address
    const address = await CustomerAddress.findOne({
      _id: addressId,
      customerId
    });

    if (!address) {
      return res.status(404).json({
        status: false,
        message: 'Address not found'
      });
    }

    // If setting as primary, ensure no other address is primary
    if (primary === true) {
      await CustomerAddress.updateMany(
        { customerId },
        { $set: { isPrimary: false } }
      );
    }

    // Update address fields
    if (addressLine) address.addressName = addressLine.trim();
    if (city) address.city = city.trim();
    if (pinCode) address.pinCode = pinCode.trim();
    if (state) address.state = state.trim();
    if (primary !== undefined) address.isPrimary = primary;

    // Update full address string
    address.fullAddress = `${address.addressName}, ${address.city}, ${address.state} - ${address.pinCode}`;

    await address.save();

    res.status(200).json({
      status: true,
      message: 'Address updated successfully',
      address: {
        id: address._id,
        addressLine: address.addressName,
        city: address.city,
        pinCode: address.pinCode,
        state: address.state,
        primary: address.isPrimary
      }
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  addOrUpdateCustomer,
  getCustomerDetails,
  updateCustomerAddress
};
