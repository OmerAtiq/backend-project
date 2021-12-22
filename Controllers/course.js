const Course = require('../model/course')
const Bootcamp = require('../model/bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../Middleware/asynchandler')



exports.getCourses = asyncHandler(async (req, res, next) => {
    let query

    if(req.params.bootcampId){
        query = Course.find({bootcamp : req.params.bootcampId})
        console.log("IF")
    }
    else{
        query = Course.find().populate({
            path : "bootcamp",
            select : "name description"
        })
    }

    const courses = await query
 
    res.status(200).json({ success: true, count: courses.length, data: courses })

})

// Get Single Course
exports.singleCourse = asyncHandler(async (req, res, next) => {
    const courses = await Course.findById(req.params.id)
    .populate({
        path:"bootcamp",
        select:"name description"
    })
res.status(200).json({ sucess: true, data: courses })

if (!courses) {
  
   next(new ErrorResponse(`courses not found `, 400))
} 
res.status(200).json({ success: true, count: courses.length, data: courses })

}) 
//add course in bootcamp

exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if(!bootcamp){
        return next(
            new ErrorResponse(
                `No bootcamp with id of ${req.params.bootcampId}`, 404
            )
        )
    }
    if(bootcamp.user.toString() != req.user.id && req.user.role != 'admin'){
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add this course to bootcamp ${bootcamp._id}`, 401
            )
        )
    }
    const course = await Course.create(req.body)
    res.status(200).json({
        success : true,
        data : course

    })
})

//Update Course

exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id)

    if(!course){
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
        )
    }
    //make sure user is course owner
    if(course.user.toString() != req.user.id && req.user.role != 'admin'){
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update course ${course._id}`, 401
            )
        )
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidator : true
    })
    res.status(200).json({
        sucess : true,
        data : course
    })
})

//delete course
exports.deleteCourse = asyncHandler(async ( req, res, next) => {
    const course = await Course.findById(req.params.id)
    if(!course){
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
        )
    }
    if(course.user.toString() != req.user.id && req.user.role != 'admin'){
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete course ${course._id}`, 401
            )
        )
    }

    await course.remove()

    res.status(200).json({
        sucess : true,
        data : {}
    })
})


