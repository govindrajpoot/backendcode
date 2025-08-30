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

    // Validate required fields - only customerId, productInformation, and orderDate are mandatory
    if (!customerId || !productInformation || !orderDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'customerId, productInformation, and orderDate are required fields' 
      });
    }

    // Generate order number in ddMMyyyyhhmmsss format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    const orderNumber = `${day}${month}${year}${hours}${minutes}${seconds}${milliseconds}`;

    // Create new order with user association
    const newOrder = new Order({
      customerId,
      userId,
      orderNumber,
      productInformation,
      quantity: quantity || 1,
      numberOfBoxes: numberOfBoxes || 1,
      orderDate,
      weight: weight || 0.1,
      orderValue: orderValue || 0,
      productDescription: productDescription || '',
      dimensions: dimensions || { length: 0.1, width: 0.1, height: 0.1 },
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

const getAllOrders = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const userId = req.user.id;
    const {
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Validate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    // Base filter
    let filter = { userId };

    // Universal Search
    if (search && typeof search === "string") {
      const regex = { $regex: search, $options: "i" }; // case-insensitive
      const numericSearch = !isNaN(search) ? Number(search) : null;

      filter.$or = [
        // String fields
        { orderNumber: regex },
        { productInformation: regex },
        { productDescription: regex },
        { specialInstructions: regex },
        { orderStatus: regex },

        // Numeric fields (only if search is number)
        ...(numericSearch !== null
          ? [
              { quantity: numericSearch },
              { numberOfBoxes: numericSearch },
              { weight: numericSearch },
              { orderValue: numericSearch },
              { "dimensions.length": numericSearch },
              { "dimensions.width": numericSearch },
              { "dimensions.height": numericSearch },
            ]
          : []),
      ];
    }

    // Allowed sort fields
    const allowedSortFields = ["createdAt", "orderValue", "orderDate", "quantity"];
    if (sortBy && !allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sortBy field. Allowed: ${allowedSortFields.join(", ")}`,
      });
    }

    // Sorting
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalCount = await Order.countDocuments(filter);

    // Fetch orders
    const orders = await Order.find(filter)
      .populate("customerId", "name email phone")
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum);

    // If no orders
    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No matching orders found.",
        count: 0,
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        orders: [],
      });
    }

    // Get shipment counts for all orders
    const Shipment = require('../models/Shipment');
    const orderIds = orders.map(order => order._id);
    const shipmentCounts = await Shipment.aggregate([
      { $match: { orderId: { $in: orderIds }, userId: userId } },
      { $group: { _id: '$orderId', count: { $sum: 1 } } }
    ]);

    // Create a map of orderId to shipment count
    const shipmentCountMap = {};
    shipmentCounts.forEach(item => {
      shipmentCountMap[item._id.toString()] = item.count;
    });

    // Add shipment count to each order
    const ordersWithShipments = orders.map(order => ({
      ...order.toObject(),
      shipmentCount: shipmentCountMap[order._id.toString()] || 0
    }));

    // Success response
    res.status(200).json({
      success: true,
      count: orders.length,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      orders: ordersWithShipments,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching orders",
      error: error.message,
    });
  }
};

module.exports = { getAllOrders };






// const getAllOrders = async (req, res) => {
//   try {
//     // Validate user authentication
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: 'Unauthorized: User not authenticated'
//       });
//     }

//     const userId = req.user.id;
//     const {
//       search,
//       customerId,
//       orderStatus,
//       productInformation,
//       minOrderValue,
//       maxOrderValue,
//       startDate,
//       endDate,
//       sortBy = 'createdAt',
//       sortOrder = 'desc',
//       page = 1,
//       limit = 10
//     } = req.query;

//     // Validate pagination parameters
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid pagination parameters'
//       });
//     }

//     // Build filter object
//     let filter = { userId };

//     // Universal search parameter - searches across all text fields
//     if (search && typeof search === 'string') {
//       filter.$or = [
//         { productInformation: { $regex: search, $options: 'i' } },
//         { productDescription: { $regex: search, $options: 'i' } },
//         { specialInstructions: { $regex: search, $options: 'i' } },
//         { orderNumber: { $regex: search, $options: 'i' } },
//         { orderStatus: { $regex: search, $options: 'i' } },
//         { 'dimensions.length': { $regex: search, $options: 'i' } },
//         { 'dimensions.width': { $regex: search, $options: 'i' } },
//         { 'dimensions.height': { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Filter by customer
//     if (customerId) filter.customerId = customerId;

//     // Filter by status
//     if (orderStatus) filter.orderStatus = orderStatus;

//     // Filter by product information
//     if (productInformation) {
//       filter.productInformation = { $regex: productInformation, $options: 'i' };
//     }

//     // Filter by order value range
//     if (minOrderValue || maxOrderValue) {
//       filter.orderValue = {};
//       if (minOrderValue) filter.orderValue.$gte = parseFloat(minOrderValue);
//       if (maxOrderValue) filter.orderValue.$lte = parseFloat(maxOrderValue);
//     }

//     // Filter by date range
//     if (startDate || endDate) {
//       filter.orderDate = {};
//       if (startDate) filter.orderDate.$gte = new Date(startDate);
//       if (endDate) filter.orderDate.$lte = new Date(endDate);
//     }

//     // Filter by quantity range
//     if (req.query.minQuantity || req.query.maxQuantity) {
//       filter.quantity = {};
//       if (req.query.minQuantity) filter.quantity.$gte = parseInt(req.query.minQuantity);
//       if (req.query.maxQuantity) filter.quantity.$lte = parseInt(req.query.maxQuantity);
//     }

//     // Filter by weight range
//     if (req.query.minWeight || req.query.maxWeight) {
//       filter.weight = {};
//       if (req.query.minWeight) filter.weight.$gte = parseFloat(req.query.minWeight);
//       if (req.query.maxWeight) filter.weight.$lte = parseFloat(req.query.maxWeight);
//     }

//     // Filter by number of boxes range
//     if (req.query.minBoxes || req.query.maxBoxes) {
//       filter.numberOfBoxes = {};
//       if (req.query.minBoxes) filter.numberOfBoxes.$gte = parseInt(req.query.minBoxes);
//       if (req.query.maxBoxes) filter.numberOfBoxes.$lte = parseInt(req.query.maxBoxes);
//     }

//     // // Filter by exact dimensions
//     // if (req.query.length) filter['dimensions.length'] = parseFloat(req.query.length);
//     // if (req.query.width) filter['dimensions.width'] = parseFloat(req.query.width);
//     // if (req.query.height) filter['dimensions.height'] = parseFloat(req.query.height);

//     // Validate sortBy field (optional: add allowed fields)
//     const allowedSortFields = ['createdAt', 'orderValue', 'orderDate', 'quantity'];
//     if (sortBy && !allowedSortFields.includes(sortBy)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid sortBy field. Allowed: ${allowedSortFields.join(', ')}`
//       });
//     }

//     // Sort configuration
//     const sortConfig = {};
//     sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     // Pagination
//     const skip = (pageNum - 1) * limitNum;

//     // Get total count for pagination
//     const totalCount = await Order.countDocuments(filter);

//     // Get orders with filters, sorting, and pagination
//     const orders = await Order.find(filter)
//       .populate('customerId', 'name email phone')
//       .sort(sortConfig)
//       .skip(skip)
//       .limit(limitNum);

//     // If no orders found, return custom message with status 200
//     if (orders.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: 'No matching orders found.',
//         count: 0,
//         totalCount,
//         currentPage: pageNum,
//         totalPages: Math.ceil(totalCount / limitNum),
//         orders: []
//       });
//     }

//     // Success response
//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       totalCount,
//       currentPage: pageNum,
//       totalPages: Math.ceil(totalCount / limitNum),
//       orders
//     });
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error while fetching orders',
//       error: error.message
//     });
//   }
// };


// Get order by ID (user-specific) with shipment information
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

    // Get shipment information for this order
    const Shipment = require('../models/Shipment');
    const shipments = await Shipment.find({ orderId: id, userId })
      .populate('shippingAddress', 'addressName fullAddress')
      .sort({ createdAt: -1 });

    const shipmentCount = shipments.length;
    const shipmentStatuses = shipments.map(shipment => shipment.status);

    res.status(200).json({
      success: true,
      order: {
        ...order.toObject(),
        shipmentCount,
        shipments: shipments,
        shipmentStatuses
      }
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
