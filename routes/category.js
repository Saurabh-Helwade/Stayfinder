const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing"); // Fixed naming convention

router.get('/category/:category', wrapAsync(async (req, res) => {
    try {
        const category = req.params.category;
        const allListings = await Listing.find({ category });
        
        res.render("listings/category.ejs", { category, allListings }); // Fixed path and variable name
    } catch (err) {
        console.error(err);
        req.flash("error", "Error loading category listings");
        res.redirect("/listings");
    }
}));

module.exports = router;