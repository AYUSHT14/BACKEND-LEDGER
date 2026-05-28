const express = require('express');
const cors = require('cors');
const authRouter = require("./routes/auth.route")
const accountRouter = require("./routes/account.routes")
const app = express();
const cookieParser = require("cookie-parser");
// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000"
];

if (process.env.FRONTEND_URL) {
    const url = process.env.FRONTEND_URL.trim();
    allowedOrigins.push(url);
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        allowedOrigins.push(`https://${url}`);
        allowedOrigins.push(`http://${url}`);
    } else {
        const bareUrl = url.replace(/^https?:\/\//, '');
        allowedOrigins.push(bareUrl);
    }
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, "").trim();
        const isAllowed = allowedOrigins.some(allowed => {
            const normalizedAllowed = allowed.trim().replace(/\/$/, "");
            return normalizedOrigin === normalizedAllowed;
        });
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`[CORS Warning] Origin "${origin}" blocked. Allowed origins are:`, allowedOrigins);
            callback(null, false); // Block origin but do not crash the Node process
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

/**
 * Routes
 * @desc All routes
 * @access Public
 */

const transactionRouter = require("./routes/transaction.routes");

app.get("/", (req, res) => {
    res.status(200).json({
        status: "active",
        message: "💎 NexaPay Ultra-Premium Banking API is live and healthy!",
        version: "1.0.0",
        database: "Connected"
    });
});

app.use("/api/auth",authRouter);
app.use("/api/account",accountRouter);
app.use("/api/transaction",transactionRouter);
module.exports = app;
