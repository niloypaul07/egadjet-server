require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Middleware to ensure DB connection before handling routes
app.use('/api', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'eGadjet API is running' });
});

// Mount routes immediately (before server starts)
const authRoutes = require('./routes/auth');
const gadgetRoutes = require('./routes/gadgets');
const reviewRoutes = require('./routes/reviews');
const aiRoutes = require('./routes/ai');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/gadgets', gadgetRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/orders', orderRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  (async () => {
    await connectDB();
    
    // Auto-seed if empty
    const Gadget = require('./models/Gadget');
    const { seedData } = require('./utils/seed');
    const count = await Gadget.countDocuments();
    if (count === 0) {
      console.log('Database is empty. Auto-seeding default data...');
      await seedData();
    }
    
    app.listen(PORT, () => {
      console.log(`eGadjet server running on port ${PORT}`);
    });
  })().catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });
}

// Export for Vercel
module.exports = app;
