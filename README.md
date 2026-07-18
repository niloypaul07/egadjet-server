# eGadjet Server

AI-powered gadget ecommerce REST API built with Node.js, Express, and MongoDB.

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start MongoDB locally, then seed the database:
   ```bash
   npm run seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The API runs at `http://localhost:5000`.

## Demo Credentials

- Email: `demo@egadjet.com`
- Password: `demo123`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user (protected) |
| GET | `/api/gadgets` | List gadgets (search, filter, sort, paginate) |
| GET | `/api/gadgets/:id` | Get gadget details |
| POST | `/api/gadgets` | Create gadget (protected) |
| DELETE | `/api/gadgets/:id` | Delete gadget (protected) |
| POST | `/api/reviews/:gadgetId` | Add review (protected) |
| POST | `/api/ai/chat` | AI shopping assistant chat |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `CLIENT_URL` | Frontend URL for CORS |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `OPENAI_API_KEY` | OpenAI API key (optional, fallback mode without it) |
