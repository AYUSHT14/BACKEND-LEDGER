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

module.exports = transactionRoutes