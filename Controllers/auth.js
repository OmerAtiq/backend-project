const crypto = require('crypto')
const asyncHandler =  require('../Middleware/asynchandler')
const User = require ('../model/User.js')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')

//@desc Register user
//@route POST /api/v1/auth/register
//@acess public

exports.register=asyncHandler(async(req,res,next)=>{
    const {name, email, password, role} = req.body 

    //Create User
    const user = await User.create({
        name,
        email,
        password,
        role,
    })

    res.status(200).json({sucess:true, data : user })
})

exports.login = asyncHandler (async (req, res, next)=>{
    const {email, password} = req.body

    if(!email || !password){
        return next (new ErrorResponse('Please provide an email and password'))
    }

    const user = await User.findOne({email : email}).select('+password')
    if(!user){
        return next (new ErrorResponse('Invalid credentials', 401))
    }

    //chk match
    const isMatch = await user.matchPassword(password)
    if(!isMatch){
        return next (new ErrorResponse('Invalid credentials', 401))
    }
    sendTokenResponse(user, 200, res)
})

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken()

    const options = { 
        expires : new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 *1000,
        ),
        httpOnly : true
    }
    res.status(statusCode).cookie('token', token, options).json({
        sucess : true,
        token,
    })
}
// get current logged in user
// GET/api/v1/auth/me
// Private

exports.getMe = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id)
    res.status(200).json({
        success : true,
        data : user,
    })

})

exports.ForgetPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email})

    if(!user){
        return next(new ErrorResponse ('There is no user with that email', 404 ))
    }

    // get rest token

    const resetToken = user.getResetPasswordToken()
    // console.log(resetToken)

    await user.save({validateBeforeSave:false})
    const resetUrl = `${req.protocol} ://${req.get (
        'host',
    )}/api/v1/auth/resetpassword/${resetToken}`

    const message = `You are receiving this email because you (or some else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

    try{
        await sendEmail({
            email : user.email,
            subject : 'Password reset token',
            message,
        })
        res.status(200).json({sucess : true, data : 'Email Sent'})
    }
    catch(err){
        console.log(err),
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave : false})

        return next(new ErrorResponse('Email could not be sent', 500))
    }

})
//reset password
exports.resetPassword = asyncHandler(async (req, res, next) => {
    //get hashed token
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire : {$gt : Date.now()}
    })
    if(!user){
        return next(new ErrorResponse('invalid token', 400))
    }
    //set new password

    user.password = req.body.password,
    user.resetPasswordToken = undefined,
    user.resetPasswordExpire = undefined,

    await user.save()

    sendTokenResponse(user, 200, res)
})

//Update user details
//put 
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name : req.body.name,
        email : req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new : true,
        runValidator : true,
    })
    res.status(200).json({
        sucess : true,
        data : user
    })

})

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
   
    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword)))
    {
      return next(new ErrorResponse('Password is incorrect', 401));
    }
   
    user.password = req.body.newPassword;
    await user.save();
   
    sendTokenResponse(user, 200, res);
   });

   // @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
   
    res.status(200).json({
      success: true,
      User : "User logout",
      data: {},
    });
   });
   
   