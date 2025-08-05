const CustomerAddress = require('../models/CustomerAddress');

// Add address to customer
exports.addAddress = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { addressName, fullAddress } = req.body;

    if (!addressName || !fullAddress) {
      return res.status(400).json({ status: false, message: 'Address name and full address are required' });
    }

    const newAddress = new CustomerAddress({
      customerId,
      addressName,
      fullAddress
    });

    await newAddress.save();

    res.status(201).json({ status: true, message: 'Address added successfully', address: newAddress });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', error: err.message });
  }
};

// Get all addresses for customer
exports.getCustomerAddresses = async (req, res) => {
  try {
    const { customerId } = req.params;
    const addresses = await CustomerAddress.find({ customerId });
    res.status(200).json({ status: true, addresses });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', error: err.message });
  }
};

// Get specific address
exports.getAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const address = await CustomerAddress.findById(addressId);
    if (!address) {
      return res.status(404).json({ status: false, message: 'Address not found' });
    }
    res.status(200).json({ status: true, address });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', error: err.message });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { addressName, fullAddress } = req.body;

    const updatedAddress = await CustomerAddress.findByIdAndUpdate(
      addressId,
      { addressName, fullAddress },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ status: false, message: 'Address not found' });
    }

    res.status(200).json({ status: true, message: 'Address updated successfully', address: updatedAddress });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', error: err.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const deletedAddress = await CustomerAddress.findByIdAndDelete(addressId);

    if (!deletedAddress) {
      return res.status(404).json({ status: false, message: 'Address not found' });
    }

    res.status(200).json({ status: true, message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Server error', error: err.message });
  }
};
