const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const {createAccountController, getUserAccountsController, getAccountBalanceController, depositFundsController, deleteAccountController} = require("../controllers/account.controller");

router.post("/create",   authMiddleware, createAccountController);
router.get("/",          authMiddleware, getUserAccountsController);
router.get("/balance/:accountId", authMiddleware, getAccountBalanceController);

/**
 * POST /api/account/deposit
 * Deposit money into your own account (simulates ATM/external deposit)
 * Body: { accountId, amount }
 */
router.post("/deposit",  authMiddleware, depositFundsController);
router.delete("/:accountId", authMiddleware, deleteAccountController);

module.exports = router;