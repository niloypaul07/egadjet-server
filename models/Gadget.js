const mongoose = require('mongoose');

const gadgetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, maxlength: 200 },
    fullDescription: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Smartphones', 'Laptops', 'Audio', 'Wearables', 'Gaming', 'Accessories', 'Smart Home'],
    },
    brand: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    stock: { type: Number, default: 10, min: 0 },
    location: { type: String, default: 'Dhaka Warehouse' },
    specifications: {
      processor: String,
      memory: String,
      storage: String,
      display: String,
      battery: String,
      connectivity: String,
    },
    featured: { type: Boolean, default: false },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

gadgetSchema.index({ title: 'text', shortDescription: 'text', brand: 'text' });

module.exports = mongoose.model('Gadget', gadgetSchema);
