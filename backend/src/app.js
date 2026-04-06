const express = require('express');
const cors = require('cors');
const authRouter = require("./routes/auth.route")
const accountRouter = require("./routes/account.routes")
const app = express();
const cookieParser = require("cookie-parser");
// Middleware
app.use(cors({
    origin: "http://localhost:5173",
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

app.use("/api/auth",authRouter);
app.use("/api/account",accountRouter);
app.use("/api/transaction",transactionRouter);
module.exports = app;
