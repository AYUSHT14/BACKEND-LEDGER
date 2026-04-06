const express = require('express');
const authController = require("../controllers/auth.controller");
const router = express.Router();

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
router.post("/register",authController.userRegisterController)

/**
 * @desc Login a user
 * @route POST /api/auth/login
 * @access Public
 */
router.post("/login",authController.userLoginController)
router.post("/logout",authController.userLogoutController)
module.exports = router;