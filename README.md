# 💎 NexaPay — Ultra-Premium Fintech & Double-Entry Ledger System

NexaPay is a world-class, production-ready banking and double-entry ledger application. It features a handcrafted, ultra-premium fintech user interface inspired by elite products like **Stripe, Apple Card, and Linear**. 

Built with a highly robust **React (Vite) + Node.js (Express) + MongoDB (Mongoose)** stack, the system enforces absolute mathematical ledger integrity via an immutable, double-entry transaction record while providing a stunning, glassmorphic dark-theme user experience.

---

## 📸 Interface Design & Redesign Highlights

- **Obsidian Dark Aesthetic**: Handcrafted dark theme utilizing deep obsidian `#030712` tones, animated radial mesh gradients, and elegant glassmorphism.
- **Physical Matte Bank Cards**: 4 premium matte credit card designs featuring metallic shimmers on hover and glowing selection borders.
- **Active Card Filtering**: Click any card in your dashboard carousel to dynamically filter the unified transaction list to show only history involving that account.
- **Currency-Aware Labels**: Transaction descriptions dynamically lookup matching user accounts to show clear contexts like `"To your INR account (···B5A3)"` instead of generic IDs.
- **Obsidian SaaS Controls**: Re-engineered buttons, tables, forms, and navigation links with inner box shadows and subtle glows.

---

## ⚡ Core Banking Features

1. **🔒 Secure User Authentication**: Multi-layered JSON Web Token (JWT) session architecture with robust logout and strict session isolation.
2. **🏦 Multi-Currency Account Management**: Open separate, isolated active accounts in **INR (₹)**, **USD ($)**, or **EUR (€)**.
3. **💰 Add Money (Deposits)**: Simulates ATM or external deposits securely into any of your own accounts.
4. **💸 Snappy Bank Transfers**: Send money between different accounts instantly. Enforces mathematical balance checks and transaction-level idempotency to prevent duplicate charges.
5. **📋 Detailed Transaction History**: Paginated, filterable, and searchable ledger history with distinct credit, debit, and transfer markings.
6. **🗑️ Close / Delete Account**: Safely close empty accounts (must have exactly ₹0.00 balance) to declutter the dashboard. Automatically purges dead ledger/transaction objects.

---

## 🏦 Double-Entry Ledger & Mathematical Integrity

At the core of NexaPay is an **immutable, double-entry bookkeeping ledger** that protects the bank's mathematical consistency:
- **Immutable Ledger Schema**: Ledger documents contain an `immutable` flag on all critical properties (account, amount, type, transaction) and block all `save`, `updateOne`, `updateMany`, and `deleteOne` modifications at the database layer.
- **Strict Credit/Debit Matching**: Every bank transfer generates a `DEBIT` ledger entry for the sender, a corresponding `CREDIT` ledger entry for the receiver, and a single master `transaction` document linking them.
- **Computed Balances**: Account balances are never stored as static database values (which can be manipulated or desynced). Instead, balances are computed on-the-fly via high-performance MongoDB Aggregation pipelines that calculate `totalCredit - totalDebit` dynamically from ledger documents.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), React Router, Axios, Vanilla CSS (Design Tokens + Glassmorphism).
- **Backend**: Node.js (Express), JSON Web Tokens (JWT), Cookies, Nodemon.
- **Database**: MongoDB (Mongoose Schema design with index optimizations).

---

## 📁 System Architecture

```
BACKEND-LEDGER/
├── backend/
│   ├── src/
│   │   ├── config/          # Mongoose connection and environment configuration
│   │   ├── controllers/     # Controller handlers (auth, account, transaction)
│   │   ├── middleware/      # Auth security middlewares (JWT validation, session prioritization)
│   │   ├── model/           # Mongoose Database Models (user, account, ledger, transaction)
│   │   ├── routes/          # Express API route endpoints
│   │   └── services/        # Third-party simulations (mock email notifications)
│   ├── server.js            # Express server entry point
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared components (Sidebar, TopBar, AccountCard, TransactionItem)
│   │   ├── context/         # React state contexts (Auth Session Context)
│   │   ├── pages/           # Page routes (Dashboard, Login, Register, Transfer, Transactions)
│   │   ├── services/        # Frontend API call handlers (Axios interface)
│   │   ├── App.jsx          # Route declarations
│   │   └── index.css        # Ultraluxury design system and premium CSS theme
│   ├── index.html           # Main HTML shell (Google Fonts links)
│   └── package.json         # Vite package configurations
└── README.md                # Project documentation
```

---

## ⚙️ Local Installation & Execution

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and a local MongoDB instance running on your machine:
```bash
# Verify installations
node -v
mongod --version
```

### 1. Set Up the Backend
1. Open a terminal in the `backend` directory.
2. Install the node dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create/verify the `.env` file inside the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/backend-ledger
   JWT_SECRET=your_ultra_secure_jwt_secret_key
   ```
4. Start the backend development server (automatically reloads using nodemon):
   ```bash
   npm run dev
   ```
   *The server will boot up on **`http://localhost:5000`** and confirm `MongoDB Connected`.*

### 2. Set Up the Frontend
1. Open a new terminal in the `frontend` directory.
2. Install the node dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Vite will boot up the frontend and serve it on **`http://localhost:5173`**.*

---

## 🚀 Production Deployment
This repo deploys as two services:
- **Backend:** Railway (`https://backend-ledger-production.up.railway.app`)
- **Frontend:** Vercel (`https://backend-ledger-kohl.vercel.app`)

### Backend (Railway)
1. In Railway, configure the backend service and set these variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL=https://backend-ledger-kohl.vercel.app`

2. Email configuration (optional but recommended):
   - For Gmail OAuth2: `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`, `EMAIL_USER`
   - Or for generic SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `EMAIL_USER`, `EMAIL_PASS`

3. Make sure the backend service is deployed to `backend` and that it starts successfully.
4. Confirm the backend is reachable at:
   - `https://backend-ledger-production.up.railway.app/api/auth`
   - `https://backend-ledger-production.up.railway.app/api/account`
   - `https://backend-ledger-production.up.railway.app/api/transaction`

### Frontend (Vercel)
1. In Vercel, create/import the project from GitHub and point the root to `frontend`.
2. Add this environment variable in Vercel:
   - `VITE_API_URL=https://backend-ledger-production.up.railway.app/api`

3. Deploy the Vercel project.
4. Visit the Vercel URL and make sure the app loads correctly.

### Important Notes
- Your backend must allow CORS from the frontend domain, which is configured using `FRONTEND_URL` in Railway.
- The frontend will use `VITE_API_URL` to call the Railway backend.
- If you want the backend root URL to show a simple message, add a `GET /` route in `backend/src/app.js`.

### Example `.env.example`
- `backend/.env.example` contains the backend variables.
- `frontend/.env.example` contains the frontend env variable.

## 🔌 API Reference

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register`: Create a new user account.
* `POST /api/auth/login`: Login user. Sets a secure HTTP cookie and returns a JWT token.
* `POST /api/auth/logout`: Safely invalidate token and clear browser cookies.

### 🏦 Accounts (`/api/account`)
* `POST /api/account/create`: Open a new bank account (`INR`, `USD`, or `EUR`).
* `GET /api/account/`: Fetch all accounts owned by the authenticated user.
* `GET /api/account/balance/:accountId`: Fetch computed balance for a specific account.
* `POST /api/account/deposit`: Deposit money simulate-credit into an account.
* `DELETE /api/account/:accountId`: Delete/Close an empty account (balance must be ₹0.00).

### 💸 Transactions & Ledger (`/api/transaction`)
* `POST /api/transaction/`: Execute an instant, secure transfer between accounts.
* `GET /api/transaction/`: Fetch paginated transaction history involving the user's accounts.
