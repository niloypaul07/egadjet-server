const bcrypt = require('bcryptjs');

// In-memory data store for mock mode
const users = [];
const gadgets = [];
const reviews = [];
const orders = [];

const initMockDb = async () => {
  if (users.length > 0) return; // Already initialized

  const demoPassword = await bcrypt.hash('demo123', 12);

  const demoUser = {
    _id: '65a000000000000000000001',
    name: 'Demo User',
    email: 'demo@egadjet.com',
    password: demoPassword,
    role: 'user',
    avatar: '',
    provider: 'local',
    comparePassword: async function (candidate) {
      return bcrypt.compare(candidate, this.password);
    },
    save: async function() { return this; }
  };

  const adminUser = {
    _id: '65a000000000000000000002',
    name: 'Admin User',
    email: 'admin@egadjet.com',
    password: demoPassword,
    role: 'admin',
    avatar: '',
    provider: 'local',
    comparePassword: async function (candidate) {
      return bcrypt.compare(candidate, this.password);
    },
    save: async function() { return this; }
  };

  users.push(demoUser, adminUser);

  const seedGadgets = [
    {
      _id: '65a000000000000000000011',
      title: 'Apple iPhone 15 Pro Max',
      shortDescription: 'Titanium design with A17 Pro chip and 5x optical zoom camera system.',
      fullDescription: 'The iPhone 15 Pro Max features a Grade 5 titanium frame, the powerful A17 Pro chip built on 3nm technology, and a pro camera system with 48MP main sensor, 5x telephoto zoom, and advanced computational photography.',
      price: 1499,
      category: 'Smartphones',
      brand: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
      ],
      rating: 4.9,
      reviewCount: 342,
      stock: 25,
      location: 'Dhaka Warehouse',
      featured: true,
      specifications: {
        processor: 'Apple A17 Pro',
        memory: '8GB RAM',
        storage: '256GB',
        display: '6.7" Super Retina XDR OLED',
        battery: '4422 mAh',
        connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3',
      },
      seller: demoUser._id,
      createdAt: new Date(),
    },
    {
      _id: '65a000000000000000000012',
      title: 'Samsung Galaxy S24 Ultra',
      shortDescription: 'Galaxy AI-powered flagship with S Pen and 200MP camera.',
      fullDescription: 'Samsung Galaxy S24 Ultra brings Galaxy AI to your fingertips with Circle to Search, Live Translate, and Note Assist. The 200MP adaptive pixel sensor captures stunning detail, while the built-in S Pen enables precision note-taking.',
      price: 1299,
      category: 'Smartphones',
      brand: 'Samsung',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34c5519dff?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34c5519dff?w=800&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80',
      ],
      rating: 4.8,
      reviewCount: 287,
      stock: 30,
      location: 'Chittagong Hub',
      featured: true,
      specifications: {
        processor: 'Snapdragon 8 Gen 3',
        memory: '12GB RAM',
        storage: '512GB',
        display: '6.8" Dynamic AMOLED 2X',
        battery: '5000 mAh',
        connectivity: '5G, Wi-Fi 7, Bluetooth 5.3',
      },
      seller: demoUser._id,
      createdAt: new Date(),
    },
    {
      _id: '65a000000000000000000013',
      title: 'MacBook Pro 14 M3 Pro',
      shortDescription: 'Professional laptop with M3 Pro chip and Liquid Retina XDR display.',
      fullDescription: 'The 14-inch MacBook Pro with M3 Pro chip delivers exceptional performance for developers, creators, and professionals. Features a stunning Liquid Retina XDR display, up to 18 hours of battery life.',
      price: 1999,
      category: 'Laptops',
      brand: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
      ],
      rating: 4.9,
      reviewCount: 198,
      stock: 15,
      location: 'Dhaka Warehouse',
      featured: true,
      specifications: {
        processor: 'Apple M3 Pro 11-core CPU',
        memory: '18GB Unified Memory',
        storage: '512GB SSD',
        display: '14.2" Liquid Retina XDR',
        battery: 'Up to 18 hours',
        connectivity: 'Wi-Fi 6E, Bluetooth 5.3, Thunderbolt 4',
      },
      seller: demoUser._id,
      createdAt: new Date(),
    },
    {
      _id: '65a000000000000000000014',
      title: 'Sony WH-1000XM5',
      shortDescription: 'Industry-leading noise canceling headphones with 30-hour battery.',
      fullDescription: 'Sony WH-1000XM5 headphones feature the most advanced noise canceling technology, exceptional sound quality with LDAC support, and up to 30 hours of battery life.',
      price: 349,
      category: 'Audio',
      brand: 'Sony',
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f8aeaddc4ef8?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1618366712010-f8aeaddc4ef8?w=800&q=80'],
      rating: 4.8,
      reviewCount: 423,
      stock: 50,
      location: 'Dhaka Warehouse',
      featured: true,
      specifications: {
        processor: 'V1 + QN1 Processors',
        memory: 'N/A',
        storage: 'N/A',
        display: 'N/A',
        battery: '30 hours (NC on)',
        connectivity: 'Bluetooth 5.2, NFC, 3.5mm',
      },
      seller: demoUser._id,
      createdAt: new Date(),
    }
  ];

  gadgets.push(...seedGadgets);

  const seedReviews = [
    { _id: '65a000000000000000000021', gadget: gadgets[0]._id, user: adminUser._id, rating: 5, comment: 'Best iPhone ever. The titanium build feels incredible.' },
    { _id: '65a000000000000000000022', gadget: gadgets[0]._id, user: adminUser._id, rating: 5, comment: 'Worth every penny.' },
  ];

  reviews.push(...seedReviews);
};

const setupMongooseMock = (mongoose) => {
  console.log('Patching Mongoose Models for Mock Database operations...');

  const originalModel = mongoose.model;

  mongoose.model = function (name, schema) {
    let ModelClass;
    try {
      ModelClass = originalModel.call(mongoose, name, schema);
    } catch {
      ModelClass = originalModel.call(mongoose, name);
    }

    // Intercept ModelClass calls
    const mockModel = function (data) {
      this._id = data._id || `65a000000000000000000${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      Object.assign(this, data);
      
      this.save = async function () {
        if (name === 'User') {
          const exists = users.find(u => u.email === this.email);
          if (!exists) {
            this.comparePassword = async function(candidate) {
              return bcrypt.compare(candidate, this.password);
            };
            users.push(this);
          }
        } else if (name === 'Gadget') {
          const idx = gadgets.findIndex(g => g._id === this._id);
          if (idx >= 0) gadgets[idx] = this;
          else gadgets.push(this);
        } else if (name === 'Review') {
          reviews.push(this);
        } else if (name === 'Order') {
          orders.push(this);
        }
        return this;
      };

      this.deleteOne = async function () {
        if (name === 'Gadget') {
          const idx = gadgets.findIndex(g => g._id.toString() === this._id.toString());
          if (idx >= 0) gadgets.splice(idx, 1);
        }
        return { deletedCount: 1 };
      };

      return this;
    };

    // Attach static methods to mockModel
    mockModel.find = function (filter = {}) {
      let list = [];
      if (name === 'Gadget') list = gadgets;
      else if (name === 'Review') list = reviews;
      else if (name === 'User') list = users;
      else if (name === 'Order') list = orders;

      // Basic filtering
      let results = [...list];
      if (filter.category && filter.category !== 'all') {
        results = results.filter(item => item.category === filter.category);
      }
      if (filter.brand && filter.brand !== 'all') {
        results = results.filter(item => item.brand === filter.brand);
      }
      if (filter.featured) {
        results = results.filter(item => item.featured === true);
      }
      if (filter.user) {
        results = results.filter(item => item.user?.toString() === filter.user.toString());
      }
      if (filter.gadget) {
        results = results.filter(item => item.gadget?.toString() === filter.gadget.toString());
      }

      const chain = {
        populate: () => chain,
        sort: () => chain,
        skip: () => chain,
        limit: (l) => {
          results = results.slice(0, l);
          return chain;
        },
        then: (cb) => Promise.resolve(results).then(cb),
        catch: (cb) => Promise.resolve(results).catch(cb),
      };

      // Allow using as thenable
      Object.assign(chain, Promise.resolve(results));
      chain.constructor = Promise;
      return chain;
    };

    mockModel.findOne = function (filter = {}) {
      let list = [];
      if (name === 'User') list = users;
      else if (name === 'Gadget') list = gadgets;

      const found = list.find(item => {
        if (filter.email && item.email === filter.email) return true;
        if (filter._id && item._id.toString() === filter._id.toString()) return true;
        return false;
      });

      const chain = {
        select: () => chain,
        populate: () => chain,
        then: (cb) => Promise.resolve(found).then(cb),
      };
      Object.assign(chain, Promise.resolve(found));
      return chain;
    };

    mockModel.findById = function (id) {
      let list = [];
      if (name === 'Gadget') list = gadgets;
      else if (name === 'User') list = users;
      else if (name === 'Order') list = orders;

      const found = list.find(item => item._id.toString() === id?.toString());

      const chain = {
        populate: () => chain,
        then: (cb) => Promise.resolve(found).then(cb),
      };
      Object.assign(chain, Promise.resolve(found));
      return chain;
    };

    mockModel.countDocuments = function (filter = {}) {
      return Promise.resolve(gadgets.length);
    };

    mockModel.distinct = function (field) {
      if (field === 'brand') {
        const brands = Array.from(new Set(gadgets.map(g => g.brand)));
        return Promise.resolve(brands);
      }
      return Promise.resolve([]);
    };

    mockModel.aggregate = function (pipeline) {
      // Mock category stats
      if (name === 'Gadget') {
        const stats = [
          { _id: 'Smartphones', count: 2, avgPrice: 1399 },
          { _id: 'Laptops', count: 1, avgPrice: 1999 },
          { _id: 'Audio', count: 1, avgPrice: 349 }
        ];
        return Promise.resolve(stats);
      }
      return Promise.resolve([]);
    };

    mockModel.insertMany = function (docs) {
      const created = docs.map(d => {
        const inst = new mockModel(d);
        inst.save();
        return inst;
      });
      return Promise.resolve(created);
    };

    mockModel.create = function (doc) {
      const inst = new mockModel(doc);
      inst.save();
      return Promise.resolve(inst);
    };

    mockModel.deleteMany = function (filter = {}) {
      if (name === 'Review') reviews.length = 0;
      else if (name === 'Gadget') gadgets.length = 0;
      return Promise.resolve({ deletedCount: 1 });
    };

    return mockModel;
  };
};

module.exports = {
  initMockDb,
  setupMongooseMock
};
