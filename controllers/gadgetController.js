const Gadget = require('../models/Gadget');
const Review = require('../models/Review');

const buildGadgetQuery = (query) => {
  const filter = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }

  if (query.brand && query.brand !== 'all') {
    filter.brand = query.brand;
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.minRating) {
    filter.rating = { $gte: Number(query.minRating) };
  }

  if (query.featured === 'true') {
    filter.featured = true;
  }

  return filter;
};

const getSortOption = (sort) => {
  switch (sort) {
    case 'price-asc':
      return { price: 1 };
    case 'price-desc':
      return { price: -1 };
    case 'rating':
      return { rating: -1 };
    case 'newest':
      return { createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
};

const getGadgets = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Number(req.query.limit) || 12);
    const skip = (page - 1) * limit;
    const filter = buildGadgetQuery(req.query);
    const sort = getSortOption(req.query.sort);

    const [gadgets, total] = await Promise.all([
      Gadget.find(filter)
        .populate('seller', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Gadget.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: gadgets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeaturedGadgets = async (_req, res) => {
  try {
    const gadgets = await Gadget.find({ featured: true }).sort({ rating: -1 }).limit(8);
    res.json({ success: true, data: gadgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGadgetById = async (req, res) => {
  try {
    const gadget = await Gadget.findById(req.params.id).populate('seller', 'name email avatar');
    if (!gadget) {
      return res.status(404).json({ success: false, message: 'Gadget not found' });
    }

    const reviews = await Review.find({ gadget: gadget._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    const related = await Gadget.find({
      _id: { $ne: gadget._id },
      category: gadget.category,
    })
      .limit(4)
      .sort({ rating: -1 });

    res.json({ success: true, data: { gadget, reviews, related } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createGadget = async (req, res) => {
  try {
    const gadget = await Gadget.create({ ...req.body, seller: req.user._id });
    res.status(201).json({ success: true, data: gadget });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyGadgets = async (req, res) => {
  try {
    const gadgets = await Gadget.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: gadgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGadget = async (req, res) => {
  try {
    const gadget = await Gadget.findById(req.params.id);
    if (!gadget) {
      return res.status(404).json({ success: false, message: 'Gadget not found' });
    }

    if (gadget.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this gadget' });
    }

    const allowed = ['title', 'shortDescription', 'fullDescription', 'price', 'category', 'brand', 'imageUrl', 'images', 'stock', 'location', 'featured', 'specifications'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) gadget[field] = req.body[field];
    });

    await gadget.save();
    res.json({ success: true, data: gadget });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteGadget = async (req, res) => {
  try {
    const gadget = await Gadget.findById(req.params.id);
    if (!gadget) {
      return res.status(404).json({ success: false, message: 'Gadget not found' });
    }

    if (gadget.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this gadget' });
    }

    await Review.deleteMany({ gadget: gadget._id });
    await gadget.deleteOne();
    res.json({ success: true, message: 'Gadget deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCategories = async (_req, res) => {
  const categories = ['Smartphones', 'Laptops', 'Audio', 'Wearables', 'Gaming', 'Accessories', 'Smart Home'];
  res.json({ success: true, data: categories });
};

const getBrands = async (_req, res) => {
  try {
    const brands = await Gadget.distinct('brand');
    res.json({ success: true, data: brands.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStats = async (_req, res) => {
  try {
    const [totalGadgets, totalReviews, categoryStats, monthlySales] = await Promise.all([
      Gadget.countDocuments(),
      Review.countDocuments(),
      Gadget.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
        { $sort: { count: -1 } },
      ]),
      Gadget.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 6 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalGadgets,
        totalReviews,
        categoryStats,
        monthlySales,
        happyCustomers: 12500,
        avgRating: 4.7,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGadgets,
  getFeaturedGadgets,
  getGadgetById,
  createGadget,
  getMyGadgets,
  deleteGadget,
  updateGadget,
  getCategories,
  getBrands,
  getStats,
};
