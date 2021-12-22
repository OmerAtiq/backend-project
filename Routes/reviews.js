const express = require('express');
const {
   getReviews,
//    getReview,
   // addReview,
   // updateReview,
   // deleteReview
} = require('../controllers/reviews');

const Review = require('../model/Review');

const router = express.Router({ mergeParams: true });

const advResults = require('../middleware/advanceResults');

const { protect, authorize } = require('../middleware/auth');

router
   .route('/')
   .get(
    advResults(Review, {
           path: 'bootcamp',
           select: 'name description'
       }),
       getReviews
   )

//    router
//    .route('/:id')
//    .get(getReview)

module.exports = router;


