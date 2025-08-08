const Order = require('../models/Order');
const Customer = require('../models/Customer');

// Create a new order (user-specific)
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    const {
      customerId,
      productInformation,
      quantity,
      numberOfBoxes,
      orderDate,
      weight,
      orderValue,
      productDescription,
      dimensions,
      specialInstructions
    } = req.body;

    // Validate customer exists and belongs to this user
    const customer = await Customer.findOne({ _id: customerId, userId });
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found or not authorized' 
      });
    }

    // Validate required fields
    if (!customerId || !productInformation || !quantity || !numberOfBoxes || 
        !orderDate || !weight || !orderValue || !productDescription || !dimensions) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Validate dimensions
    if (!dimensions.length || !dimensions.width || !dimensions.height) {
      return res.status(400).json({ 
        success: false, 
        message: 'All dimension fields are required' 
      });
    }

    // Create new order with user association
    const newOrder = new Order({
      customerId,
      userId,
      productInformation,
      quantity,
      numberOfBoxes,
      orderDate,
      weight,
      orderValue,
      productDescription,
      dimensions,
      specialInstructions: specialInstructions || ''
    });

    const savedOrder = await newOrder.save();

    // Populate customer details
    await savedOrder.populate('customerId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating order', 
      error: error.message 
    });
  }
};

// Get all orders for the authenticated user
const getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({ userId })
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders', 
      error: error.message 
    });
  }
};

// Get order by ID (user-specific)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, userId })
      .populate('customerId', 'name email phone');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or not authorized' 
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching order', 
      error: error.message 
    });
  }
};

// Get orders by customer ID (user-specific)
const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user.id;

    // Verify customer belongs to this user
    const customer = await Customer.findOne({ _id: customerId, userId });
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found or not authorized' 
      });
    }

    const orders = await Order.find({ customerId, userId })
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching customer orders', 
      error: error.message 
    });
  }
};

// Update order status (user-specific)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { orderStatus } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid order status' 
      });
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, userId },
      { orderStatus },
      { new: true }
    ).populate('customerId', 'name email phone');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or not authorized' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating order status', 
      error: error.message 
    });
  }
};

// Update order details (user-specific)
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.userId;

    const order = await Order.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('customerId', 'name email phone');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or not authorized' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating order', 
      error: error.message 
    });
  }
};

// Delete order (user-specific)
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOneAndDelete({ _id: id, userId });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or not authorized' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting order', 
      error: error.message 
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByCustomer,
  updateOrderStatus,
  updateOrder,
  deleteOrder
};
