const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dns = require('dns');

// Fix: Node.js v18+ defaults to 127.0.0.1 for DNS which blocks SRV lookups.
// Force Google DNS so mongodb+srv:// URIs resolve correctly.
if (dns.getServers().includes('127.0.0.1') || dns.getServers().includes('::1')) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

let mongod = null;
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if already connected (for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  let uri = process.env.MONGODB_URI;
  const isLocal = !uri || uri.includes('127.0.0.1') || uri.includes('localhost');

  if (isLocal) {
    try {
      console.log('Starting in-memory MongoDB (MongoMemoryServer)...');
      mongod = await MongoMemoryServer.create({
        instance: { port: 27017, dbName: 'egadjet' },
      });
      uri = mongod.getUri();
      console.log(`In-memory MongoDB started: ${uri}`);
    } catch {
      try {
        mongod = await MongoMemoryServer.create({ instance: { dbName: 'egadjet' } });
        uri = mongod.getUri();
        console.log(`In-memory MongoDB started on random port: ${uri}`);
      } catch (innerErr) {
        console.warn('\n==================================================================');
        console.warn('WARNING: MongoMemoryServer could not start (vc_redist may be missing).');
        console.warn('Activating pure JS in-memory database stub.');
        console.warn('Data WILL reset on each restart, but the app will function normally.');
        console.warn('To fix permanently: provide a MongoDB Atlas URI in .env -> MONGODB_URI=mongodb+srv://...');
        console.warn('==================================================================\n');

        // Activate mock mode — skip Mongoose connection entirely
        global.dbMockMode = true;
        setupPureMockMode();
        return;
      }
    }
  }

  cachedConnection = await mongoose.connect(uri);
  console.log('MongoDB connected successfully');
  return cachedConnection;
};

// -----------------------------------------------------------------------
// Pure in-memory database stub — runs when MongoMemoryServer can't start
// -----------------------------------------------------------------------
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const store = {
  users: [],
  gadgets: [],
  reviews: [],
  orders: [],
  _initialized: false,
};

async function initStore() {
  if (store._initialized) return;
  store._initialized = true;

  const demoPassword = await bcrypt.hash('demo123', 12);

  const demoUser = {
    _id: 'user_demo_001',
    name: 'Demo User',
    email: 'demo@egadjet.com',
    password: demoPassword,
    role: 'user',
    avatar: '',
    provider: 'local',
    googleId: null,
    toObject: function () { return { ...this }; },
  };

  const adminUser = {
    _id: 'user_admin_001',
    name: 'Admin User',
    email: 'admin@egadjet.com',
    password: demoPassword,
    role: 'admin',
    avatar: '',
    provider: 'local',
    googleId: null,
    toObject: function () { return { ...this }; },
  };

  store.users.push(demoUser, adminUser);

  const seedGadgets = [
    {
      _id: 'gadget_001', title: 'Apple iPhone 15 Pro Max',
      shortDescription: 'Titanium design with A17 Pro chip and 5x optical zoom camera system.',
      fullDescription: 'The iPhone 15 Pro Max features a Grade 5 titanium frame, the powerful A17 Pro chip built on 3nm technology, and a pro camera system with 48MP main sensor, 5x telephoto zoom, and advanced computational photography. Action Button, USB-C, and all-day battery life make it the ultimate flagship smartphone.',
      price: 1499, category: 'Smartphones', brand: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'],
      rating: 4.9, reviewCount: 342, stock: 25, location: 'Dhaka Warehouse', featured: true,
      specifications: { processor: 'Apple A17 Pro', memory: '8GB RAM', storage: '256GB', display: '6.7" Super Retina XDR OLED', battery: '4422 mAh', connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_002', title: 'Samsung Galaxy S24 Ultra',
      shortDescription: 'Galaxy AI-powered flagship with S Pen and 200MP camera.',
      fullDescription: 'Samsung Galaxy S24 Ultra brings Galaxy AI to your fingertips with Circle to Search, Live Translate, and Note Assist. The 200MP adaptive pixel sensor captures stunning detail, while the built-in S Pen enables precision note-taking and creative expression on the 6.8-inch Dynamic AMOLED display.',
      price: 1299, category: 'Smartphones', brand: 'Samsung',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34c5519dff?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1610945265064-0e34c5519dff?w=800&q=80', 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80'],
      rating: 4.8, reviewCount: 287, stock: 30, location: 'Chittagong Hub', featured: true,
      specifications: { processor: 'Snapdragon 8 Gen 3', memory: '12GB RAM', storage: '512GB', display: '6.8" Dynamic AMOLED 2X', battery: '5000 mAh', connectivity: '5G, Wi-Fi 7, Bluetooth 5.3' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_003', title: 'MacBook Pro 14 M3 Pro',
      shortDescription: 'Professional laptop with M3 Pro chip and Liquid Retina XDR display.',
      fullDescription: 'The 14-inch MacBook Pro with M3 Pro chip delivers exceptional performance for developers, creators, and professionals. Features a stunning Liquid Retina XDR display, up to 18 hours of battery life, and a comprehensive port selection including HDMI, SD card slot, and MagSafe charging.',
      price: 1999, category: 'Laptops', brand: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80'],
      rating: 4.9, reviewCount: 198, stock: 15, location: 'Dhaka Warehouse', featured: true,
      specifications: { processor: 'Apple M3 Pro 11-core CPU', memory: '18GB Unified Memory', storage: '512GB SSD', display: '14.2" Liquid Retina XDR', battery: 'Up to 18 hours', connectivity: 'Wi-Fi 6E, Bluetooth 5.3, Thunderbolt 4' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_004', title: 'Dell XPS 15 OLED',
      shortDescription: 'Premium Windows laptop with 3.5K OLED display and Intel Core i7.',
      fullDescription: 'Dell XPS 15 combines premium craftsmanship with powerful performance. The 3.5K OLED InfinityEdge display delivers vivid colors and deep blacks, while the 13th Gen Intel Core i7 processor and NVIDIA RTX graphics handle demanding creative workloads with ease.',
      price: 1799, category: 'Laptops', brand: 'Dell',
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80'],
      rating: 4.7, reviewCount: 156, stock: 20, location: 'Sylhet Center', featured: false,
      specifications: { processor: 'Intel Core i7-13700H', memory: '16GB DDR5', storage: '1TB NVMe SSD', display: '15.6" 3.5K OLED Touch', battery: '86 Wh', connectivity: 'Wi-Fi 6E, Bluetooth 5.2, Thunderbolt 4' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_005', title: 'Sony WH-1000XM5',
      shortDescription: 'Industry-leading noise canceling headphones with 30-hour battery.',
      fullDescription: 'Sony WH-1000XM5 headphones feature the most advanced noise canceling technology, exceptional sound quality with LDAC support, and up to 30 hours of battery life. Multipoint connection lets you seamlessly switch between devices.',
      price: 349, category: 'Audio', brand: 'Sony',
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f8aeaddc4ef8?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1618366712010-f8aeaddc4ef8?w=800&q=80'],
      rating: 4.8, reviewCount: 423, stock: 50, location: 'Dhaka Warehouse', featured: true,
      specifications: { processor: 'V1 + QN1 Processors', memory: 'N/A', storage: 'N/A', display: 'N/A', battery: '30 hours (NC on)', connectivity: 'Bluetooth 5.2, NFC, 3.5mm' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_006', title: 'Apple AirPods Pro 2',
      shortDescription: 'Active noise cancellation with Adaptive Audio and USB-C charging.',
      fullDescription: 'AirPods Pro (2nd generation) with USB-C deliver up to 2x more Active Noise Cancellation, Adaptive Audio that dynamically blends Transparency and ANC, and Personalized Spatial Audio for immersive listening.',
      price: 249, category: 'Audio', brand: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80'],
      rating: 4.7, reviewCount: 512, stock: 80, location: 'Chittagong Hub', featured: true,
      specifications: { processor: 'H2 Chip', memory: 'N/A', storage: 'N/A', display: 'N/A', battery: '6 hours (ANC on)', connectivity: 'Bluetooth 5.3, MagSafe, USB-C' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_007', title: 'Apple Watch Ultra 2',
      shortDescription: 'Rugged smartwatch with precision dual-frequency GPS and 36-hour battery.',
      fullDescription: 'Apple Watch Ultra 2 is built for endurance athletes and outdoor adventurers. The brightest Apple display ever, precision dual-frequency GPS, advanced health features including ECG and blood oxygen, and a titanium case rated for depths up to 100 meters.',
      price: 799, category: 'Wearables', brand: 'Apple',
      imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80'],
      rating: 4.8, reviewCount: 234, stock: 35, location: 'Dhaka Warehouse', featured: false,
      specifications: { processor: 'S9 SiP', memory: '64GB Storage', storage: '64GB', display: '49mm Always-On Retina', battery: 'Up to 36 hours', connectivity: 'GPS, LTE, Bluetooth 5.3' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_008', title: 'PlayStation 5 Slim',
      shortDescription: 'Next-gen gaming console with ultra-high speed SSD and ray tracing.',
      fullDescription: 'PlayStation 5 Slim delivers lightning-fast loading with an ultra-high speed SSD, stunning ray tracing, 4K gaming at up to 120fps, and the innovative DualSense wireless controller with haptic feedback and adaptive triggers.',
      price: 499, category: 'Gaming', brand: 'Sony',
      imageUrl: 'https://images.unsplash.com/photo-1606814894318-7ff589968340?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1606814894318-7ff589968340?w=800&q=80'],
      rating: 4.9, reviewCount: 678, stock: 40, location: 'Dhaka Warehouse', featured: true,
      specifications: { processor: 'AMD Zen 2 8-core', memory: '16GB GDDR6', storage: '1TB SSD', display: 'Up to 8K / 4K 120Hz', battery: 'N/A', connectivity: 'Wi-Fi 6, Bluetooth 5.1, HDMI 2.1' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_009', title: 'Logitech MX Master 3S',
      shortDescription: 'Ergonomic wireless mouse with 8K DPI sensor and quiet clicks.',
      fullDescription: 'Logitech MX Master 3S is the ultimate productivity mouse with an 8,000 DPI sensor, quiet clicks, MagSpeed electromagnetic scrolling, and the ability to connect to three devices simultaneously via Bluetooth or the included USB receiver.',
      price: 99, category: 'Accessories', brand: 'Logitech',
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'],
      rating: 4.6, reviewCount: 891, stock: 100, location: 'Sylhet Center', featured: false,
      specifications: { processor: 'N/A', memory: 'N/A', storage: 'N/A', display: 'N/A', battery: '70 days on full charge', connectivity: 'Bluetooth, USB Receiver' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_010', title: 'Amazon Echo Show 10',
      shortDescription: 'Smart display with motion tracking and premium Alexa experience.',
      fullDescription: 'Echo Show 10 features a 10.1-inch HD screen that moves with you, keeping you in frame during video calls. Premium speakers deliver rich sound, and Alexa helps manage your smart home, play music, and stay connected.',
      price: 249, category: 'Smart Home', brand: 'Amazon',
      imageUrl: 'https://images.unsplash.com/photo-1558089687-fc73e3448c34?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1558089687-fc73e3448c34?w=800&q=80'],
      rating: 4.5, reviewCount: 167, stock: 45, location: 'Chittagong Hub', featured: false,
      specifications: { processor: 'AZ2 Neural Edge', memory: '1GB RAM', storage: '8GB', display: '10.1" HD Touchscreen', battery: 'N/A (AC powered)', connectivity: 'Wi-Fi, Bluetooth, Zigbee' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_011', title: 'Google Pixel 8 Pro',
      shortDescription: 'AI-first smartphone with Magic Editor and 7 years of updates.',
      fullDescription: 'Google Pixel 8 Pro is built around AI with Magic Editor, Best Take, and Audio Magic Eraser. The Tensor G3 chip powers advanced computational photography, while Google guarantees 7 years of OS and security updates.',
      price: 999, category: 'Smartphones', brand: 'Google',
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b173ca71925?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1598327105666-5b173ca71925?w=800&q=80'],
      rating: 4.7, reviewCount: 203, stock: 28, location: 'Dhaka Warehouse', featured: false,
      specifications: { processor: 'Google Tensor G3', memory: '12GB RAM', storage: '128GB', display: '6.7" LTPO OLED 120Hz', battery: '5050 mAh', connectivity: '5G, Wi-Fi 7, Bluetooth 5.3' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
    {
      _id: 'gadget_012', title: 'ASUS ROG Zephyrus G16',
      shortDescription: 'Thin gaming laptop with RTX 4070 and Nebula OLED display.',
      fullDescription: 'ASUS ROG Zephyrus G16 combines portability with gaming power. The Nebula OLED display delivers stunning visuals, while the NVIDIA RTX 4070 GPU and Intel Core i9 processor handle the latest AAA titles at high settings.',
      price: 2199, category: 'Gaming', brand: 'ASUS',
      imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80'],
      rating: 4.6, reviewCount: 134, stock: 12, location: 'Dhaka Warehouse', featured: true,
      specifications: { processor: 'Intel Core i9-13900H', memory: '32GB DDR5', storage: '1TB NVMe SSD', display: '16" ROG Nebula OLED 240Hz', battery: '90 Wh', connectivity: 'Wi-Fi 6E, Bluetooth 5.3' },
      seller: { _id: demoUser._id, name: demoUser.name, email: demoUser.email }, createdAt: new Date(),
    },
  ];

  store.gadgets.push(...seedGadgets);

  store.reviews.push(
    { _id: 'rev_001', gadget: 'gadget_001', user: { _id: adminUser._id, name: adminUser.name, avatar: '' }, rating: 5, comment: 'Best iPhone ever. The titanium build feels incredible and the camera is phenomenal.', createdAt: new Date() },
    { _id: 'rev_002', gadget: 'gadget_001', user: { _id: adminUser._id, name: adminUser.name, avatar: '' }, rating: 5, comment: 'Worth every penny. Battery lasts all day even with heavy use.', createdAt: new Date() },
    { _id: 'rev_003', gadget: 'gadget_003', user: { _id: adminUser._id, name: adminUser.name, avatar: '' }, rating: 5, comment: 'M3 Pro is a beast for video editing. Silent and fast.', createdAt: new Date() },
    { _id: 'rev_004', gadget: 'gadget_005', user: { _id: adminUser._id, name: adminUser.name, avatar: '' }, rating: 5, comment: 'Noise cancellation is unmatched. Perfect for flights and commutes.', createdAt: new Date() },
    { _id: 'rev_005', gadget: 'gadget_008', user: { _id: adminUser._id, name: adminUser.name, avatar: '' }, rating: 5, comment: 'PS5 Slim is compact and runs every game smoothly at 4K.', createdAt: new Date() }
  );
}

function generateId() {
  return 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function setupPureMockMode() {
  const express = require('express');

  // Lazy-initialize store on first request
  const ensureInit = async (req, res, next) => {
    await initStore();
    next();
  };

  const router = express.Router();
  router.use(ensureInit);

  // ---- AUTH ROUTES ----
  router.post('/auth/register', async (req, res) => {
    await initStore();
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    if (store.users.find(u => u.email === email)) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = { _id: generateId(), name, email, password: hashed, role: 'user', avatar: '', provider: 'local', googleId: null };
    store.users.push(user);
    sendToken(user, 201, res);
  });

  router.post('/auth/login', async (req, res) => {
    await initStore();
    const { email, password } = req.body;
    const user = store.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    sendToken(user, 200, res);
  });

  router.post('/auth/logout', (_req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  router.get('/auth/me', requireAuth, async (req, res) => {
    await initStore();
    const user = store.users.find(u => u._id === req.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } });
  });

  router.post('/auth/google', (req, res) => {
    res.status(501).json({ success: false, message: 'Google login not supported in demo mode. Use email/password.' });
  });

  // ---- GADGET ROUTES ----
  router.get('/gadgets', async (req, res) => {
    await initStore();
    let results = [...store.gadgets];
    const { search, category, brand, minPrice, maxPrice, minRating, sort, page = 1, limit = 12 } = req.query;

    if (search) {
      const s = search.toLowerCase();
      results = results.filter(g => g.title.toLowerCase().includes(s) || g.brand.toLowerCase().includes(s) || g.shortDescription.toLowerCase().includes(s));
    }
    if (category && category !== 'all') results = results.filter(g => g.category === category);
    if (brand && brand !== 'all') results = results.filter(g => g.brand === brand);
    if (minPrice) results = results.filter(g => g.price >= Number(minPrice));
    if (maxPrice) results = results.filter(g => g.price <= Number(maxPrice));
    if (minRating) results = results.filter(g => g.rating >= Number(minRating));

    if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);
    else results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = results.length;
    const p = Math.max(1, Number(page));
    const l = Math.min(24, Number(limit));
    const paginated = results.slice((p - 1) * l, p * l);

    res.json({ success: true, data: paginated, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } });
  });

  router.get('/gadgets/featured', async (req, res) => {
    await initStore();
    const featured = store.gadgets.filter(g => g.featured).sort((a, b) => b.rating - a.rating).slice(0, 8);
    res.json({ success: true, data: featured });
  });

  router.get('/gadgets/stats', async (req, res) => {
    await initStore();
    const categoryStats = [];
    const catMap = {};
    store.gadgets.forEach(g => {
      if (!catMap[g.category]) catMap[g.category] = { count: 0, total: 0 };
      catMap[g.category].count++;
      catMap[g.category].total += g.price;
    });
    Object.entries(catMap).forEach(([cat, d]) => categoryStats.push({ _id: cat, count: d.count, avgPrice: d.total / d.count }));
    categoryStats.sort((a, b) => b.count - a.count);

    res.json({ success: true, data: { totalGadgets: store.gadgets.length, totalReviews: store.reviews.length, categoryStats, monthlySales: [], happyCustomers: 12500, avgRating: 4.7 } });
  });

  router.get('/gadgets/categories', (_req, res) => {
    res.json({ success: true, data: ['Smartphones', 'Laptops', 'Audio', 'Wearables', 'Gaming', 'Accessories', 'Smart Home'] });
  });

  router.get('/gadgets/brands', async (req, res) => {
    await initStore();
    const brands = Array.from(new Set(store.gadgets.map(g => g.brand))).sort();
    res.json({ success: true, data: brands });
  });

  router.get('/gadgets/my', requireAuth, async (req, res) => {
    await initStore();
    const my = store.gadgets.filter(g => g.seller?._id === req.userId || g.seller === req.userId);
    res.json({ success: true, data: my });
  });

  router.get('/gadgets/:id', async (req, res) => {
    await initStore();
    const gadget = store.gadgets.find(g => g._id === req.params.id);
    if (!gadget) return res.status(404).json({ success: false, message: 'Gadget not found' });
    const reviews = store.reviews.filter(r => r.gadget === gadget._id);
    const related = store.gadgets.filter(g => g._id !== gadget._id && g.category === gadget.category).slice(0, 4);
    res.json({ success: true, data: { gadget, reviews, related } });
  });

  router.post('/gadgets', requireAuth, async (req, res) => {
    await initStore();
    const user = store.users.find(u => u._id === req.userId);
    const gadget = { _id: generateId(), ...req.body, seller: { _id: user._id, name: user.name, email: user.email }, createdAt: new Date() };
    store.gadgets.push(gadget);
    res.status(201).json({ success: true, data: gadget });
  });

  router.delete('/gadgets/:id', requireAuth, async (req, res) => {
    await initStore();
    const idx = store.gadgets.findIndex(g => g._id === req.params.id);
    if (idx < 0) return res.status(404).json({ success: false, message: 'Gadget not found' });
    store.gadgets.splice(idx, 1);
    res.json({ success: true, message: 'Gadget deleted successfully' });
  });

  // ---- REVIEW ROUTES ----
  router.post('/reviews/:gadgetId', requireAuth, async (req, res) => {
    await initStore();
    const { rating, comment } = req.body;
    const gadget = store.gadgets.find(g => g._id === req.params.gadgetId);
    if (!gadget) return res.status(404).json({ success: false, message: 'Gadget not found' });
    const user = store.users.find(u => u._id === req.userId);
    const review = { _id: generateId(), gadget: gadget._id, user: { _id: user._id, name: user.name, avatar: user.avatar }, rating, comment, createdAt: new Date() };
    store.reviews.push(review);
    res.status(201).json({ success: true, data: review });
  });

  // ---- AI ROUTE ----
  router.post('/ai/chat', (req, res) => {
    const { message } = req.body;
    res.json({ success: true, data: { reply: `I'm eGadjet's AI assistant in demo mode. You asked: "${message}". For full AI features, configure your OpenAI API key in the server .env file.` } });
  });

  // ---- ORDER ROUTES ----
  router.post('/orders', requireAuth, async (req, res) => {
    await initStore();
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items in order' });

    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const gadget = store.gadgets.find(g => g._id === item.gadget);
      if (!gadget) return res.status(404).json({ success: false, message: `Gadget not found: ${item.gadget}` });
      if (gadget.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${gadget.title}` });
      gadget.stock -= item.quantity;
      totalAmount += gadget.price * item.quantity;
      orderItems.push({ gadget: { _id: gadget._id, title: gadget.title, imageUrl: gadget.imageUrl, price: gadget.price }, quantity: item.quantity, price: gadget.price });
    }

    const order = { _id: generateId(), user: req.userId, items: orderItems, shippingAddress, totalAmount, paymentMethod, status: 'Pending', createdAt: new Date() };
    store.orders.push(order);
    res.status(201).json({ success: true, data: order });
  });

  router.get('/orders/my', requireAuth, async (req, res) => {
    await initStore();
    const myOrders = store.orders.filter(o => o.user === req.userId).reverse();
    res.json({ success: true, data: myOrders });
  });

  // Attach mock router to app
  global._mockRouter = router;
}

// JWT helper for mock mode
function sendToken(user, statusCode, res) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'egadjet-dev-secret-key-2025', { expiresIn: '7d' });
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
  });
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Not authorized' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'egadjet-dev-secret-key-2025');
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = connectDB;
module.exports.getMockRouter = () => global._mockRouter;
