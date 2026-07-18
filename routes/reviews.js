const express = require('express');
const { protect } = require('../middleware/auth');
const { addReview } = require('../controllers/reviewController');

const router = express.Router();

router.post('/:gadgetId', protect, addReview);

module.exports = router;
