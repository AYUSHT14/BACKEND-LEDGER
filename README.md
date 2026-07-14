# 💎 NexaPay — Ultra-Premium Fintech & Double-Entry Ledger System

Live demo: [https://backend-ledger-kohl.vercel.app](https://backend-ledger-kohl.vercel.app)

NexaPay is a world-class, production-ready banking and double-entry ledger application. Built with a highly robust stack, the system enforces absolute mathematical ledger integrity via an immutable, double-entry transaction record while providing a stunning, glassmorphic dark-theme user experience.

## ✨ Features

- **Multi-Currency Accounts** — Open isolated accounts in INR (₹), USD ($), or EUR (€)
- **Instant Bank Transfers** — Send money between accounts instantly with strict balance checks
- **Add Money (Deposits)** — Securely deposit funds into any of your own accounts
- **Mathematical Integrity** — Immutable double-entry ledger ensuring absolute balance accuracy
- **Premium Interface** — Handcrafted obsidian dark aesthetic with dynamic card filtering
- **Secure Authentication** — JWT-based authentication with robust session isolation

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, Vanilla CSS (Glassmorphism) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, Cookies |
| Deployment | Railway (Backend) + Vercel (Frontend) |

## 📁 Project Structure

```
BACKEND-LEDGER/
├── backend/
│   ├── src/
│   │   ├── config/          # Mongoose & env configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth & session middleware
│   │   ├── model/           # Database schemas
│   │   ├── routes/          # Express API routes
│   │   └── services/        # Third-party integrations
│   ├── server.js            # Express server entry point
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React state contexts
│   │   ├── pages/           # Application screens
│   │   ├── services/        # API client
│   │   ├── App.jsx          # Routing & layout
│   │   └── index.css        # Premium design system
│   └── package.json         # Frontend dependencies
└── package.json             # Root scripts
```

## 🚀 Setup

```bash
# 1. Setup Backend
cd backend
npm install
cp .env.example .env # Configure MONGO_URI and JWT_SECRET in .env
npm run dev

# 2. Setup Frontend (in a new terminal)
cd frontend
npm install
cp .env.example .env # Configure VITE_API_URL in .env
npm run dev
```

## 🌐 Deployment

- **Live Platform**: [NexaPay on Vercel](https://backend-ledger-kohl.vercel.app)
- **Backend API**: [Railway](https://backend-ledger-production.up.railway.app)

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Login user & get JWT |
| POST | `/api/auth/logout` | Logout user & clear cookies |
| POST | `/api/account/create` | Open a new bank account |
| GET | `/api/account/` | Fetch all user accounts |
| GET | `/api/account/balance/:accountId` | Fetch computed account balance |
| POST | `/api/account/deposit` | Deposit money into account |
| DELETE | `/api/account/:accountId` | Close an empty account |
| POST | `/api/transaction/` | Execute an instant bank transfer |
| GET | `/api/transaction/` | Fetch paginated transaction history |
