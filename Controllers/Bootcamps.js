const Bootcamp = require('../model/bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../Middleware/asynchandler')
const geocoder = require('../utils/geocoder')
const path = require('path')
// @desc Get all bootcamps
// @Routes Get /api/v1/bootcamps
// @acess public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
//     // console.log(req.query)
//     let query;
//     // Copy  req.query
//     const reqQuery = { ...req.query }

//     // fields to  exclude
//     const removeFields = ['select', 'sort', 'page', 'limit']




//     // Loop over remove fields and delete then from req.query
//     removeFields.forEach(param => delete reqQuery[param])
//     console.log(reqQuery)

//     console.log(reqQuery)
//     // Create query  string
//     let queryStr = JSON.stringify(reqQuery)
//     queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
//     console.log(queryStr)

//     // finding resource
//     query = Bootcamp.find(JSON.parse(queryStr)).populate('Courses')

//     // select  fields

//     if (req.query.select) {
//         const fields = req.query.select.split(',').join(' ');
//         // console.log(fields)
//         query = query.select(fields)


//     }


//     if (req.query.sort) {
//         const sortBy = req.query.sort.split(',').join('')
//         query = query.sort(sortBy)
//     }
//     else {
//         query = query.sort('-createdAt')
//     }

//     //pagination
//     const page = parseInt(req.query.page, 10) || 1
//     const limit = parseInt(req.query.limit, 10) || 1
//     const startIndex = (page - 1) * limit
//     const endIndex = page * limit
//     console.log(startIndex, "skips")
//     const total = await Bootcamp.countDocuments()
//     query = query.skip(startIndex).limit(limit)

//     const pagination = {}
//     if (endIndex < total) {
//         pagination.next = {
//             page: page + 1,
//             limit
//         }
//     }
//     if (startIndex > 0) {
//         pagination.prev = {
//             page: page - 1,
//             limit
//         }
//     }


//     const bootcamps = await query

    res.status(200).json(res.advanceResult)
    // res.status(200).json({ sucess: true, count: bootcamps.length, pagination, data: bootcamps })

})

// @desc Get Single bootcamps
// @Routes Get /api/v1/bootcamps/:id
// @acess Publi

exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    res.status(200).json({ success: true, data: bootcamp })

    if (!bootcamp) {
        next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 400))
        // res.status(400).json({ sucess: false })
    }

})

// @desc Create new bootcamp
// @Routes Post /api/v1/bootcamps
// @acess Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {

    // add user to req.body
    req.body.user = req.user.id

    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({user : req.user.id})

    if(publishedBootcamp && req.user.role != 'admin'){
        return next (new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400))
    }
    // console.log(req.body)
    const bootcamp = await Bootcamp.create(req.body)
    res.status(200).json({
        sucess: true,
        data: bootcamp
    })
})

// @desc Update bootcamp
// @Routes Put /api/v1/bootcamp/:id
// @acess Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        res.status(400).json({ success: false })
    }

if(bootcamp.user.toString() != req.user.id && req.user.role != 'admin'){
    return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update bootcamp`, 401)
    )
}
bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body,{
    new : true,
    runValidator : true,
})

    res.status(200).json({
        success: true,
        data: bootcamp
    })

    // res.status(200).json({ sucess: true, msg: `Update  bootcamp ${req.params.id}` })

})

// @desc Del bootcamp
// @Routes Delete /api/v1/bootcamp/:id
// @acess Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        res.status(400).json({ success: false })
    }
    if(bootcamp.user.toString() != req.user.id && req.user.role != 'admin'){
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to delete bootcamp`, 401)
        )
    }
    
    bootcamp.remove()
    res.status(200).json({
        success: true,
        data: {}
    })


    // res.status(200).json({ sucess: true, msg: `Delete  bootcamp ${req.params.id}` })

})

// @desc    upload   photo of bootcamp
// @Routes  put /api/v1/bootcamps/:id/photo
// @access  Private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return res.status(400).json({ sucess: false })
    }

    if (!req.files) {
        return next(
            new ErrorResponse(`please   upload   file`, 400)
        )
    }

    const file = req.files.file
    console.log(file)

    // // make sure your image is Photo

    if (!file.mimetype.startsWith('image')) {
        return res.status(400).json(`plz upload an image file`)

        // return next(new ErrorResponse(`plz upload an image file`, 400))
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`plz upload an image less then  ${process.env.MAX_FILE_UPLOAD}`, 400))

    }
    //create custum filename
    file.name = `photo ${bootcamp._id}${path.parse(file.name).ext}`
    console.log(file.name)

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.log(err)
            return next(new ErrorResponse (`problem with file upload`,500))
        }
        await bootcamp.findByIdAndUpdate(req.params.id, {photo:file.name})

    return res.status(200).json({ sucess: true, data:file.name })

    })

    // return res.status(200).json({ sucess: true })

})



exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    })
})




