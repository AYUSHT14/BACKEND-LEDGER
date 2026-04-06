const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../model/blackList.model");
async function authMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message:"Unauthorized token is missing",
            status:"failed"
        })
    }
    const isTokenBlacklisted = await tokenBlackListModel.findOne({
        token: token
    })
    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"Token is blacklisted",
            status:"failed"
        })
    }
    try {
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
        req.user = await userModel.findById(decodedToken.id)
        next()
    } catch (error) {
        return res.status(401).json({
            message:"Unauthorized",
            status:"failed"
        })
    }
}
async function authSystemMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message:"Unauthorized token is missing",
            status:"failed"
        })
    }
    const isTokenBlacklisted = await tokenBlackListModel.findOne({
        token: token
    })
    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"Token is blacklisted",
            status:"failed"
        })
    }
    try {
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
        req.user = await userModel.findById(decodedToken.id).select("+systemUser")
        
        if(!req.user){
            return res.status(401).json({
                message:"Unauthorized: User does not exist anymore",
                status:"failed"
            })
        }
        
        if(!req.user.systemUser){
            return res.status(401).json({
                message:"Unauthorized: You are not a system user! Mongoose sees your user object as: " + JSON.stringify(req.user),
                status:"failed"
            })
        }
        return next()
    } catch (error) {
        return res.status(401).json({
            message:"Unauthorized: Invalid token (" + error.message + ")",
            status:"failed"
        })
    }
}
module.exports = {authMiddleware,authSystemMiddleware}