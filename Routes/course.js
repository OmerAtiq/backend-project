const express = require('express')
const router = express.Router({mergeParams: true})


const {getCourses, singleCourse, addCourse, updateCourse, deleteCourse } = require('../Controllers/course')
const {protect, authorize} = require('../Middleware/Auth')
// router.route('/')
//     .get(getAllCourses)

router.route('/')
    .get(getCourses)
    .post(protect, authorize('publisher', 'admin'), addCourse)

router.route('/:id')
    .get(singleCourse)    
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router

