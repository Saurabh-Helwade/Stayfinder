const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

// ✅ VALIDATION SCHEMA
const { reviewSchema } = require("../schema.js");

// ✅ MIDDLEWARE
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

// ✅ CONTROLLER (correct path + naming)
const reviewController = require("../controllers/reviews.js");

/* =======================
   SERVER-SIDE VALIDATION
======================= */
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

/* =======================
   CREATE REVIEW
   POST /listings/:id/reviews
======================= */
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

/* =======================
   DELETE REVIEW
   DELETE /listings/:id/reviews/:reviewId
======================= */
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
