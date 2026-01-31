const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");

// ✅ CONTROLLER
const listingController = require("../controllers/listings.js");

// ✅ MIDDLEWARE
const {
  isLoggedIn,
  isOwner,
  validateListing
} = require("../middleware.js");

// ✅ IMAGE UPLOAD
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

/* =======================
   INDEX + CREATE
   GET  /listings
   POST /listings
======================= */
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

/* =======================
   SEARCH LISTINGS
   POST /listings/search
======================= */
router.post(
  "/search",
  wrapAsync(listingController.search)
);

/* =======================
   NEW LISTING FORM
   GET /listings/new
======================= */
router.get(
  "/new",
  isLoggedIn,
  wrapAsync(listingController.renderNewForm)
);

/* =======================
   BOOKING
   POST /listings/:id/book
======================= */
router.post(
  "/:id/book",
  isLoggedIn,
  wrapAsync(listingController.createBooking)
);

/* =======================
   SHOW / UPDATE / DELETE
   GET    /listings/:id
   PUT    /listings/:id
   DELETE /listings/:id
======================= */
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

/* =======================
   EDIT FORM
   GET /listings/:id/edit
======================= */
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
