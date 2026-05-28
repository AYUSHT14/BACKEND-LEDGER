const {Router} = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");
const transactionRoutes = Router();

/**
 * POST /api/transaction/
 * Description: Create a new transaction
 * Access: Private
 * Body: { fromAccount, toAccount, amount, idempotencyKey }
 * Response: { message, status, data }
 */
transactionRoutes.post("/",authMiddleware.authMiddleware, transactionController.createTransaction)
transactionRoutes.post("/system/initial-fund",authMiddleware.authSystemMiddleware, transactionController.createInitialFundsTransaction)

/**
 * GET /api/transaction/
 * Description: Get all transactions for the authenticated user
 * Access: Private
 * Response: { transactions, pagination, message, status }
 */
transactionRoutes.get("/",authMiddleware.authMiddleware, transactionController.getUserTransactionsController)

module.exports = transactionRoutes