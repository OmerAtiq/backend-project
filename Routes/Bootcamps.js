const express = require('express')
const router = express.Router()
const bootcamp = require('../model/bootcamp')
const advanceResults = require('../Middleware/advanceResults')


const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../Controllers/Bootcamps')
const {protect, authorize} = require('../Middleware/Auth')
const courseRouter = require('./course')
const reviewRouter = require('./reviews');
router.use('/:bootcampId/reviews', reviewRouter);


router.route('/')
    .get(advanceResults(bootcamp, 'Courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp)

router.use('/:bootcampId/course', courseRouter)

router.route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

router.route('/radius/:zipcode/:distance') .get(getBootcampsInRadius)    

module.exports = router

