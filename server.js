const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const logger = require('./Middleware/logger')
const errorHandler = require('./Middleware/Error')
const fileUpload = require('express-fileupload')
const colors = require('colors')
const morgan = require('morgan')
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser')

//protect DB
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
var xss = require('xss-clean')
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors')


dotenv.config({path : './config/config.env'})
// Router file
const bootcamps = require('./Routes/Bootcamps')
const auth = require('./Routes/auth')
const course = require('./Routes/course')
const users = require('./Routes/user')
const reviews = require('./Routes/reviews')


connectDB()
const app = express()
app.use(express.json())
app.use(errorHandler)
app.use(cookieParser())
app.use(fileUpload())
app.use(mongoSanitize())
app.use(helmet())
app.use(xss())

// Prevent http param pollution
app.use(hpp());

app.use(cors())

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
});
app.use(limiter);
 
// set static folder
app.use(express.static(path.join(__dirname, 'public')))

// app.use(logger)
// Mount router
app.use('/api/v1/bootcamps' , bootcamps)
app.use('/api/v1/auth', auth)
app.use('/api/v1/course' , course)
app.use('/api/v1/users', users )
app.use('/api/v1/users', users )
app.use('/api/v1/reviews', reviews)

//Dev logging Middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan ())
}





// Define Port
const PORT = process.env.PORT || 6000
const server = app.listen(PORT, () => {
    console.log(`Server is running ${process.env.NODE_ENV} mode on ${PORT}`.bgBlue.green)
})

// handle unhandle promise rejection
process.on('unhandledRejection',(err, promise) =>{
    console.log(`Error : ${err.message}`.bgRed.green)

    //close server & exit process
    server.close(() => process.exit(1))
})

