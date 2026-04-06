const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const {createAccountController, getUserAccountsController, getAccountBalanceController} = require("../controllers/account.controller");

router.post("/create",authMiddleware,createAccountController);
router.get("/",authMiddleware,getUserAccountsController);
/**
 * -GET /api/accounts/balance/:accountId
 * -Description: Get account balance
 * -Access: Private
 * -Response: { message, status, data }
 */
router.get("/balance/:accountId",authMiddleware,getAccountBalanceController);
module.exports = router;