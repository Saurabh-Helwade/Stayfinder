const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");

// SEARCH ROUTE
router.post(
  "/",
  wrapAsync(async (req, res) => {
    const { search } = req.body;

    if (!search || !search.trim()) {
      req.flash("error", "Please enter a search term");
      return res.redirect("/listings");
    }

    const regex = new RegExp(search.trim(), "i");

    const results = await Listing.find({
      $or: [
        { title: regex },
        { location: regex },
        { country: regex },
        { category: regex }
      ]
    });

    res.render("listings/search.ejs", {
      results,
      searchQuery: search
    });
  })
);

module.exports = router;
