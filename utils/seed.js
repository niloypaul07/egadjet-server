require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Gadget = require('../models/Gadget');
const Review = require('../models/Review');
const connectDB = require('../config/db');

const seedGadgets = [
  {
    title: 'Apple iPhone 15 Pro Max',
    shortDescription: 'Titanium design with A17 Pro chip and 5x optical zoom camera system.',
    fullDescription:
      'The iPhone 15 Pro Max features a Grade 5 titanium frame, the powerful A17 Pro chip built on 3nm technology, and a pro camera system with 48MP main sensor, 5x telephoto zoom, and advanced computational photography. Action Button, USB-C, and all-day battery life make it the ultimate flagship smartphone.',
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
  },
  {
    title: 'Samsung Galaxy S24 Ultra',
    shortDescription: 'Galaxy AI-powered flagship with S Pen and 200MP camera.',
    fullDescription:
      'Samsung Galaxy S24 Ultra brings Galaxy AI to your fingertips with Circle to Search, Live Translate, and Note Assist. The 200MP adaptive pixel sensor captures stunning detail, while the built-in S Pen enables precision note-taking and creative expression on the 6.8-inch Dynamic AMOLED display.',
    price: 1299,
    category: 'Smartphones',
    brand: 'Samsung',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
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
  },
  {
    title: 'MacBook Pro 14 M3 Pro',
    shortDescription: 'Professional laptop with M3 Pro chip and Liquid Retina XDR display.',
    fullDescription:
      'The 14-inch MacBook Pro with M3 Pro chip delivers exceptional performance for developers, creators, and professionals. Features a stunning Liquid Retina XDR display, up to 18 hours of battery life, and a comprehensive port selection including HDMI, SD card slot, and MagSafe charging.',
    price: 1999,
    category: 'Laptops',
    brand: 'Apple',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
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
  },
  {
    title: 'Dell XPS 15 OLED',
    shortDescription: 'Premium Windows laptop with 3.5K OLED display and Intel Core i7.',
    fullDescription:
      'Dell XPS 15 combines premium craftsmanship with powerful performance. The 3.5K OLED InfinityEdge display delivers vivid colors and deep blacks, while the 13th Gen Intel Core i7 processor and NVIDIA RTX graphics handle demanding creative workloads with ease.',
    price: 1799,
    category: 'Laptops',
    brand: 'Dell',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80'],
    rating: 4.7,
    reviewCount: 156,
    stock: 20,
    location: 'Sylhet Center',
    featured: false,
    specifications: {
      processor: 'Intel Core i7-13700H',
      memory: '16GB DDR5',
      storage: '1TB NVMe SSD',
      display: '15.6" 3.5K OLED Touch',
      battery: '86 Wh',
      connectivity: 'Wi-Fi 6E, Bluetooth 5.2, Thunderbolt 4',
    },
  },
  {
    title: 'Sony WH-1000XM5',
    shortDescription: 'Industry-leading noise canceling headphones with 30-hour battery.',
    fullDescription:
      'Sony WH-1000XM5 headphones feature the most advanced noise canceling technology, exceptional sound quality with LDAC support, and up to 30 hours of battery life. Multipoint connection lets you seamlessly switch between devices.',
    price: 349,
    category: 'Audio',
    brand: 'Sony',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
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
  },
  {
    title: 'Apple AirPods Pro 2',
    shortDescription: 'Active noise cancellation with Adaptive Audio and USB-C charging.',
    fullDescription:
      'AirPods Pro (2nd generation) with USB-C deliver up to 2x more Active Noise Cancellation, Adaptive Audio that dynamically blends Transparency and ANC, and Personalized Spatial Audio for immersive listening.',
    price: 249,
    category: 'Audio',
    brand: 'Apple',
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80'],
    rating: 4.7,
    reviewCount: 512,
    stock: 80,
    location: 'Chittagong Hub',
    featured: true,
    specifications: {
      processor: 'H2 Chip',
      memory: 'N/A',
      storage: 'N/A',
      display: 'N/A',
      battery: '6 hours (ANC on)',
      connectivity: 'Bluetooth 5.3, MagSafe, USB-C',
    },
  },
  {
    title: 'Apple Watch Ultra 2',
    shortDescription: 'Rugged smartwatch with precision dual-frequency GPS and 36-hour battery.',
    fullDescription:
      'Apple Watch Ultra 2 is built for endurance athletes and outdoor adventurers. The brightest Apple display ever, precision dual-frequency GPS, advanced health features including ECG and blood oxygen, and a titanium case rated for depths up to 100 meters.',
    price: 799,
    category: 'Wearables',
    brand: 'Apple',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80'],
    rating: 4.8,
    reviewCount: 234,
    stock: 35,
    location: 'Dhaka Warehouse',
    featured: false,
    specifications: {
      processor: 'S9 SiP',
      memory: '64GB Storage',
      storage: '64GB',
      display: '49mm Always-On Retina',
      battery: 'Up to 36 hours',
      connectivity: 'GPS, LTE, Bluetooth 5.3',
    },
  },
  {
    title: 'PlayStation 5 Slim',
    shortDescription: 'Next-gen gaming console with ultra-high speed SSD and ray tracing.',
    fullDescription:
      'PlayStation 5 Slim delivers lightning-fast loading with an ultra-high speed SSD, stunning ray tracing, 4K gaming at up to 120fps, and the innovative DualSense wireless controller with haptic feedback and adaptive triggers.',
    price: 499,
    category: 'Gaming',
    brand: 'Sony',
    imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80'],
    rating: 4.9,
    reviewCount: 678,
    stock: 40,
    location: 'Dhaka Warehouse',
    featured: true,
    specifications: {
      processor: 'AMD Zen 2 8-core',
      memory: '16GB GDDR6',
      storage: '1TB SSD',
      display: 'Up to 8K / 4K 120Hz',
      battery: 'N/A',
      connectivity: 'Wi-Fi 6, Bluetooth 5.1, HDMI 2.1',
    },
  },
  {
    title: 'Logitech MX Master 3S',
    shortDescription: 'Ergonomic wireless mouse with 8K DPI sensor and quiet clicks.',
    fullDescription:
      'Logitech MX Master 3S is the ultimate productivity mouse with an 8,000 DPI sensor, quiet clicks, MagSpeed electromagnetic scrolling, and the ability to connect to three devices simultaneously via Bluetooth or the included USB receiver.',
    price: 99,
    category: 'Accessories',
    brand: 'Logitech',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'],
    rating: 4.6,
    reviewCount: 891,
    stock: 100,
    location: 'Sylhet Center',
    featured: false,
    specifications: {
      processor: 'N/A',
      memory: 'N/A',
      storage: 'N/A',
      display: 'N/A',
      battery: '70 days on full charge',
      connectivity: 'Bluetooth, USB Receiver',
    },
  },
  {
    title: 'Amazon Echo Show 10',
    shortDescription: 'Smart display with motion tracking and premium Alexa experience.',
    fullDescription:
      'Echo Show 10 features a 10.1-inch HD screen that moves with you, keeping you in frame during video calls. Premium speakers deliver rich sound, and Alexa helps manage your smart home, play music, and stay connected.',
    price: 249,
    category: 'Smart Home',
    brand: 'Amazon',
    imageUrl: 'https://images.unsplash.com/photo-1512446816042-444d641267d4?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1512446816042-444d641267d4?w=800&q=80'],
    rating: 4.5,
    reviewCount: 167,
    stock: 45,
    location: 'Chittagong Hub',
    featured: false,
    specifications: {
      processor: 'AZ2 Neural Edge',
      memory: '1GB RAM',
      storage: '8GB',
      display: '10.1" HD Touchscreen',
      battery: 'N/A (AC powered)',
      connectivity: 'Wi-Fi, Bluetooth, Zigbee',
    },
  },
  {
    title: 'Google Pixel 8 Pro',
    shortDescription: 'AI-first smartphone with Magic Editor and 7 years of updates.',
    fullDescription:
      'Google Pixel 8 Pro is built around AI with Magic Editor, Best Take, and Audio Magic Eraser. The Tensor G3 chip powers advanced computational photography, while Google guarantees 7 years of OS and security updates.',
    price: 999,
    category: 'Smartphones',
    brand: 'Google',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'],
    rating: 4.7,
    reviewCount: 203,
    stock: 28,
    location: 'Dhaka Warehouse',
    featured: false,
    specifications: {
      processor: 'Google Tensor G3',
      memory: '12GB RAM',
      storage: '128GB',
      display: '6.7" LTPO OLED 120Hz',
      battery: '5050 mAh',
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.3',
    },
  },
  {
    title: 'ASUS ROG Zephyrus G16',
    shortDescription: 'Thin gaming laptop with RTX 4070 and Nebula OLED display.',
    fullDescription:
      'ASUS ROG Zephyrus G16 combines portability with gaming power. The Nebula OLED display delivers stunning visuals, while the NVIDIA RTX 4070 GPU and Intel Core i9 processor handle the latest AAA titles at high settings.',
    price: 2199,
    category: 'Gaming',
    brand: 'ASUS',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80'],
    rating: 4.6,
    reviewCount: 134,
    stock: 12,
    location: 'Dhaka Warehouse',
    featured: true,
    specifications: {
      processor: 'Intel Core i9-13900H',
      memory: '32GB DDR5',
      storage: '1TB NVMe SSD',
      display: '16" ROG Nebula OLED 240Hz',
      battery: '90 Wh',
      connectivity: 'Wi-Fi 6E, Bluetooth 5.3',
    },
  },
];

// Each (gadget, user) pair must be unique — one review per user per gadget.
// Use demoUser for some and adminUser for others to avoid duplicates.
const seedReviews = [
  { gadgetIndex: 0, userKey: 'admin', rating: 5, comment: 'Best iPhone ever. The titanium build feels incredible and the camera is phenomenal.' },
  { gadgetIndex: 0, userKey: 'demo',  rating: 5, comment: 'Worth every penny. Battery lasts all day even with heavy use.' },
  { gadgetIndex: 2, userKey: 'admin', rating: 5, comment: 'M3 Pro is a beast for video editing. Silent and fast.' },
  { gadgetIndex: 4, userKey: 'admin', rating: 5, comment: 'Noise cancellation is unmatched. Perfect for flights and commutes.' },
  { gadgetIndex: 7, userKey: 'admin', rating: 5, comment: 'PS5 Slim is compact and runs every game smoothly at 4K.' },
];

const seedData = async () => {
  await Review.deleteMany({});
  await Gadget.deleteMany({});
  await User.deleteMany({ email: { $in: ['demo@egadjet.com', 'admin@egadjet.com'] } });

  // Pass plain text — the User model's pre('save') hook will hash it
  const demoUser = await User.create({
    name: 'Demo User',
    email: 'demo@egadjet.com',
    password: 'demo123',
    role: 'user',
  });

  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@egadjet.com',
    password: 'demo123',
    role: 'admin',
  });

  const seller = demoUser._id;
  const gadgets = await Gadget.insertMany(seedGadgets.map((g) => ({ ...g, seller })));

  for (const review of seedReviews) {
    await Review.create({
      gadget: gadgets[review.gadgetIndex]._id,
      user: review.userKey === 'demo' ? demoUser._id : adminUser._id,
      rating: review.rating,
      comment: review.comment,
    });
  }

  console.log('Database seeded successfully!');
  console.log('Demo credentials: demo@egadjet.com / demo123');
};

const runSeedCli = async () => {
  await connectDB();
  await seedData();
  process.exit(0);
};

if (require.main === module) {
  runSeedCli().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = { seedData };

