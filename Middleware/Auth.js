const jwt = require('jsonwebtoken')
const asyncHandler = require('./asynchandler')
const ErrorResponse = require ('../utils/errorResponse.js')
const User = require('../model/User')

exports.protect = asyncHandler(async (req, res, next) => {
    let token

    if(
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ){
        // Set token from bearer
        token = req.headers.authorization.split(' ')[1]
        //set token from cookie
    }
    else if (req.cookies.token)
    {
        token = req.cookies.token;
    }
 
    if(!token){
        return next(new ErrorResponse('Not authorized to access this route', 401))
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)

        req.user = await User.findById(decoded.id);
        next();
    }
    catch(err){
        return next(new ErrorResponse('Not authorized to access this route', 401))
    }
})

exports.authorize = (...roles) => {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(
                new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
            )
        }
        next()
    }
}