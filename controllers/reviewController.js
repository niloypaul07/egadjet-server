const Review = require('../models/Review');
const Gadget = require('../models/Gadget');

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const gadgetId = req.params.gadgetId;

    const gadget = await Gadget.findById(gadgetId);
    if (!gadget) {
      return res.status(404).json({ success: false, message: 'Gadget not found' });
    }

    const existing = await Review.findOne({ gadget: gadgetId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this gadget' });
    }

    const review = await Review.create({
      gadget: gadgetId,
      user: req.user._id,
      rating,
      comment,
    });

    const reviews = await Review.find({ gadget: gadgetId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    gadget.rating = Math.round(avgRating * 10) / 10;
    gadget.reviewCount = reviews.length;
    await gadget.save();

    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { addReview };
