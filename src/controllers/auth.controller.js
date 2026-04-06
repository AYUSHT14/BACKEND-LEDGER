const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../model/blackList.model");
/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
async function userRegisterController(req, res) {
    try {
    const { email, password, name } = req.body;
    const isExist = await userModel.findOne({
        email:email
    });
    if(isExist){
        return res.status(400).json({
            message:"User Already exist",
            status: "failed"
        })
    }
    const user = await userModel.create({
        email,
        password,
        name
    })
    const token = jwt.sign(
        {id:user._id},
        process.env.JWT_SECRET,
        {expiresIn:"3d"}
    );
    res.cookie("token",token)

    res.status(201).json({
        user:{
            id:user._id,
            email:user.email,
            name:user.name
        },
        message:"User created successfully",
        token
    })
    
    // Send email asynchronously (don't block the API response)
    emailService.sendRegistrationEmail(user.email, user.name).catch(console.error);

    } catch (error) {
        res.status(500).json({ message: error.message, status: "failed" });
    }
}

/**
 * @desc Login a user
 * @route POST /api/auth/login
 * @access Public
 */
async function userLoginController(req,res){
 try {
 const {email,password} = req.body;
 const user = await userModel.findOne({email}).select("+password");
 if(!user){
    return res.status(401).json({
        message:"User not found",
        status:"failed"
    })
 }
 const isPasswordValid = await user.comparePassword(password);
 if(!isPasswordValid){
    return res.status(401).json({
        message:"Invalid password",
        status:"failed"
    })
 }
  const token = jwt.sign({
    id:user._id
  },
  process.env.JWT_SECRET,
{
    expiresIn:"3d"
  })
  res.cookie("token",token)
  return res.status(200).json({
    user:{
        id:user._id,
        email:user.email,
        name:user.name
    }, 
    message:"User logged in successfully",
    status:"success",
    token
  })
 } catch (error) {
    res.status(500).json({ message: error.message, status: "failed" });
 }
}
/**
 * @desc Logout a user
 * @route POST /api/auth/logout
 * @access Private
 */
async function userLogoutController(req, res) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "No token found",
                status: "failed"
            })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const isTokenBlacklisted = await tokenBlackListModel.findOne({
            token: token
        })
        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: "Token is already blacklisted",
                status: "failed"
            })
        }
        const tokenBlacklist = await tokenBlackListModel.create({
            token: token
        })
        res.clearCookie("token")
        return res.status(200).json({
            message: "User logged out successfully",
            status: "success",
            tokenBlacklist
        })
    } catch (error) {
        res.status(500).json({ message: error.message, status: "failed" });
    }
}
module.exports = {userRegisterController,userLoginController,userLogoutController}