const accountModel = require("../model/account.model");
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
module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController

}