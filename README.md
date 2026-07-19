# eGadjet - Backend API Server

RESTful API server for eGadjet, an AI-powered gadget marketplace with intelligent product recommendations using Groq LLM.

## 🌐 Live Demo

**API Server:** [https://egadjet-server.vercel.app](https://egadjet-server.vercel.app)

**Frontend Client:** [https://egadjet-client.vercel.app](https://egadjet-client.vercel.app)

## 🚀 API Endpoints

Base URL: `https://egadjet-server.vercel.app/api`

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Gadgets
- `GET /api/gadgets` - Get all gadgets (with filters & pagination)
- `GET /api/gadgets/featured` - Get featured gadgets
- `GET /api/gadgets/stats` - Get statistics
- `GET /api/gadgets/categories` - Get all categories
- `GET /api/gadgets/brands` - Get all brands
- `GET /api/gadgets/my` - Get user's gadgets (protected)
- `GET /api/gadgets/:id` - Get gadget by ID
- `POST /api/gadgets` - Create gadget (protected)
- `PUT /api/gadgets/:id` - Update gadget (protected)
- `DELETE /api/gadgets/:id` - Delete gadget (protected)

### Reviews
- `POST /api/reviews/:gadgetId` - Add review (protected)

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/chat/stream` - Streaming chat with SSE

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders/my` - Get user's orders (protected)

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based auth with refresh tokens
- 🤖 **AI Integration** - Groq + Llama 3.3 70B for intelligent recommendations
- 📊 **MongoDB Atlas** - Cloud database with Mongoose ODM
- 🔄 **Server-Sent Events** - Real-time AI streaming responses
- 📝 **Input Validation** - Request validation and sanitization
- 🔒 **CORS Protection** - Configured for specific origins
- 🎯 **Smart Fallback** - Catalog search with intelligent scoring when AI unavailable
- 📦 **Auto-Seeding** - Automatic database population with sample data

## 🏗️ Tech Stack

- **Runtime:** Node.js 24+
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Authentication:** JWT (jsonwebtoken) + bcryptjs
- **AI/LLM:** Groq SDK (Llama 3.3 70B)
- **Validation:** Express validator
- **Security:** CORS, cookie-parser
- **Deployment:** Vercel (Serverless)

## 📋 Prerequisites

- Node.js 18+ or Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Groq API key (free at [groq.com](https://groq.com))
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/niloypaul07/egadjet-server.git
cd egadjet-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=eGadjet

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=15d

# Client URL (for CORS)
CLIENT_URL=http://localhost:3001

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# AI/LLM Configuration
GROQ_API_KEY=your-groq-api-key
```

### 4. Get API Keys

**MongoDB Atlas:**
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add your IP to whitelist (or use `0.0.0.0/0` for development)

**Groq API Key:**
1. Sign up at [console.groq.com](https://console.groq.com)
2. Create a new API key
3. Copy the key (starts with `gsk_`)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Copy the Client ID

### 5. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
egadjet-server/
├── config/
│   └── db.js                  # MongoDB connection & caching
├── controllers/
│   ├── aiController.js        # AI assistant logic
│   ├── authController.js      # Authentication handlers
│   ├── gadgetController.js    # Product CRUD operations
│   ├── orderController.js     # Order management
│   └── reviewController.js    # Review system
├── middleware/
│   └── auth.js                # JWT verification middleware
├── models/
│   ├── Gadget.js              # Product schema
│   ├── Order.js               # Order schema
│   ├── Review.js              # Review schema
│   └── User.js                # User schema
├── routes/
│   ├── ai.js                  # AI assistant routes
│   ├── auth.js                # Authentication routes
│   ├── gadgets.js             # Product routes
│   ├── orders.js              # Order routes
│   └── reviews.js             # Review routes
├── utils/
│   └── seed.js                # Database seeding script
├── .env                       # Environment variables (local)
├── .env.example               # Environment template
├── index.js                   # Server entry point
├── vercel.json                # Vercel deployment config
└── package.json               # Dependencies
```

## 🔌 API Usage Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Products with Filters

```bash
GET /api/gadgets?category=Smartphones&minPrice=500&maxPrice=1500&sort=price-asc&page=1&limit=12
```

### AI Chat (Streaming)

```bash
POST /api/ai/chat/stream
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Find me a laptop under $1500 for video editing",
  "conversationHistory": []
}
```

**Response:** Server-Sent Events stream
```
data: {"type":"delta","text":"I'd recommend"}

data: {"type":"delta","text":" the MacBook Pro"}

data: {"type":"recommendations","products":[...]}

data: {"type":"done"}
```

### Create Order

```bash
POST /api/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "items": [
    {
      "gadget": "gadget_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Dhaka",
    "postalCode": "1200",
    "country": "Bangladesh"
  },
  "paymentMethod": "Cash on Delivery"
}
```

## 🤖 AI Assistant Features

### Groq Integration
- Model: `llama-3.3-70b-versatile`
- Streaming responses via SSE
- Context-aware conversations
- Budget and preference understanding

### Intelligent Fallback
When AI is unavailable, uses smart catalog search:
- **Category keywords** (+8 points)
- **Budget matching** (+4/-6 points)
- **Title relevance** (+3 points)
- **High ratings** (+0.5 per star)

### Example Queries
- "Find me a gaming laptop under $2000"
- "Best noise-canceling headphones for travel"
- "Compare iPhone 15 Pro vs Galaxy S24 Ultra"
- "Budget smartphone with good camera"

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  avatar: String,
  provider: String (local/google),
  googleId: String
}
```

### Gadget Model
```javascript
{
  title: String,
  shortDescription: String,
  fullDescription: String,
  price: Number,
  category: String,
  brand: String,
  imageUrl: String,
  images: [String],
  rating: Number,
  reviewCount: Number,
  stock: Number,
  location: String,
  featured: Boolean,
  specifications: Object,
  seller: ObjectId (ref: User)
}
```

### Order Model
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    gadget: ObjectId,
    quantity: Number,
    price: Number
  }],
  shippingAddress: Object,
  totalAmount: Number,
  paymentMethod: String,
  status: String (Pending/Processing/Shipped/Delivered)
}
```

## 🔐 Authentication Flow

1. User registers or logs in
2. Server generates JWT token
3. Token sent to client (valid for 15 days)
4. Client includes token in `Authorization: Bearer <token>` header
5. Middleware verifies token for protected routes

## 🌐 Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Configure Environment Variables

Add these in Vercel dashboard → Project Settings → Environment Variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL` (production frontend URL)
- `GOOGLE_CLIENT_ID`
- `GROQ_API_KEY`

### 4. Deploy

```bash
vercel --prod
```

Your API will be live at `https://your-project.vercel.app`

## 📊 Database Seeding

The server automatically seeds the database on first run with:
- 12 sample gadgets (smartphones, laptops, audio, gaming, etc.)
- 2 demo users (demo@egadjet.com / admin@egadjet.com)
- 5 sample reviews

To manually seed:
```javascript
// Will auto-seed when database is empty
// Or import and call seedData() from utils/seed.js
```

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- CORS protection for allowed origins
- Input validation and sanitization
- MongoDB injection prevention
- Rate limiting ready (can be added)

## 🛠️ Available Scripts

```bash
npm start           # Start production server
npm run dev         # Start development server (uses nodemon if installed)
npm test            # Run tests (if configured)
```

## 📦 Key Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "groq-sdk": "^0.3.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "cookie-parser": "^1.4.6"
}
```

## 🔗 Related Repositories

- **Frontend Client:** [egadjet-client](https://github.com/niloypaul07/egadjet-client)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Niloy Paul**
- GitHub: [@niloypaul07](https://github.com/niloypaul07)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email niloypaul07@example.com or open an issue on GitHub.

---

Made with ❤️ by Niloy Paul
