const express = require('express');
const {
   getUsers,
   getUser,
   createUser,
   updateUser,
   deleteUser
} = require('../Controllers/users');

const User = require('../model/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../Middleware/advanceResults')
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router
   .route('/')
   .get(advancedResults(User), getUsers)
   .post(createUser);

router
   .route('/:id')
   .get(getUser)
   .put(updateUser)
   .delete(deleteUser);

module.exports = router;


