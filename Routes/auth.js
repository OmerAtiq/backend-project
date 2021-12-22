const express = require('express')
const {register, login, getMe, ForgetPassword, resetPassword, updateDetails, updatePassword, logout} = require('../Controllers/auth')
const {protect} = require ('../Middleware/Auth.js') 
const router = express.Router()
router.post('/register', register )
router.post('/login', login)
router.get('/me', protect, getMe)
router.post('/forgetpassword',ForgetPassword)
router.put('/resetpassword/:resettoken',resetPassword)
router.put('/updatedetails', protect ,updateDetails)
router.put('/updatepassword', protect ,updatePassword)
router.get('/logout', logout);






module.exports = router