const accountModel      = require("../model/account.model");
const transactionModel  = require("../model/transaction.model");
const ledgerModel       = require("../model/ledger.model");

/**
 * @desc Create a new account
 * @route POST /api/account/create
 * @access Private
 */
async function createAccountController(req,res){
    try {
        const {userId,currency} = req.body;
        
        // Use the authenticated user's ID if not provided in body
        const accountUserId = userId || req.user._id;

        const account = await accountModel.create({
            userId: accountUserId,
            currency
        })
        res.status(201).json({
            account,
            message:"Account created successfully",
            status:"success"
        })
    } catch (error) {
        res.status(500).json({ message: error.message, status: "failed" });
    }
}
async function getUserAccountsController(req,res){
    try {
        const accounts = await accountModel.find({
            userId: req.user._id
        })
        res.status(200).json({
            accounts,
            message:"Accounts fetched successfully",
            status:"success"
        })
    } catch (error) {
        res.status(500).json({ message: error.message, status: "failed" });
    }
}
async function getAccountBalanceController(req,res){
    const {accountId} = req.params;
    const account = await accountModel.findOne({
        _id: accountId,
        userId: req.user._id
    })
    if(!account){
        return res.status(400).json({
            message:"Account not found"
        })
    }
    const balance = await account.getBalance();
    return res.status(200).json({
        balance,
        message:"Account balance fetched successfully",
        status:"success"
    })
}

/**
 * @desc  Deposit funds into the user's own account (simulates ATM/external deposit)
 * @route POST /api/account/deposit
 * @access Private
 */
async function depositFundsController(req, res) {
    try {
        const { accountId, amount } = req.body;

        if (!accountId || !amount || Number(amount) <= 0) {
            return res.status(400).json({
                message: "accountId and a positive amount are required",
                status: "failed"
            });
        }

        // Verify the account belongs to the authenticated user
        const account = await accountModel.findOne({
            _id: accountId,
            userId: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found or doesn't belong to you",
                status: "failed"
            });
        }

        if (account.status !== "ACTIVE") {
            return res.status(400).json({
                message: "Account must be ACTIVE to receive deposits",
                status: "failed"
            });
        }

        // Create a DEPOSIT transaction record (no session — works on standalone MongoDB)
        const idempotencyKey = `deposit-${accountId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const transaction = await transactionModel.create({
            fromAccount: accountId,
            toAccount: accountId,
            amount: Number(amount),
            idempotencyKey,
            status: "COMPLETED"
        });

        // Create CREDIT ledger entry (simulates money arriving from outside — like ATM)
        await ledgerModel.create({
            account: accountId,
            amount: Number(amount),
            transaction: transaction._id,
            type: "CREDIT"
        });

        const newBalance = await account.getBalance();

        return res.status(201).json({
            message: "Deposit successful",
            status: "success",
            transaction,
            newBalance
        });

    } catch (error) {
        res.status(500).json({ message: error.message, status: "failed" });
    }
}


async function deleteAccountController(req, res) {
    try {
        const { accountId } = req.params;

        const account = await accountModel.findOne({
            _id: accountId,
            userId: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found or doesn't belong to you",
                status: "failed"
            });
        }

        const balance = await account.getBalance();
        if (balance !== 0) {
            return res.status(400).json({
                message: `Cannot close account with active funds. Current balance is ₹${balance.toFixed(2)}. Please transfer or withdraw all funds first.`,
                status: "failed"
            });
        }

        await accountModel.deleteOne({ _id: accountId });
        await ledgerModel.deleteMany({ account: accountId });
        await transactionModel.deleteMany({
            $or: [
                { fromAccount: accountId },
                { toAccount: accountId }
            ]
        });

        return res.status(200).json({
            message: "Account deleted successfully",
            status: "success"
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "failed" });
    }
}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController,
    depositFundsController,
    deleteAccountController
}