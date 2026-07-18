const Order = require('../models/Order');
const Gadget = require('../models/Gadget');

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Verify stock and calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const gadget = await Gadget.findById(item.gadget);
      if (!gadget) {
        return res.status(404).json({ success: false, message: `Gadget not found: ${item.gadget}` });
      }

      if (gadget.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${gadget.title}. Available: ${gadget.stock}, Requested: ${item.quantity}`,
        });
      }

      // Deduct stock
      gadget.stock -= item.quantity;
      await gadget.save();

      totalAmount += gadget.price * item.quantity;
      orderItems.push({
        gadget: gadget._id,
        quantity: item.quantity,
        price: gadget.price,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentMethod,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.gadget', 'title imageUrl price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
};
