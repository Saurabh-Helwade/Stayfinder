const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

/* ================= INDEX (WITH CATEGORY FILTER) ================= */
module.exports.index = async (req, res) => {
    let { category } = req.query;
    let query = {};

    if (category && category !== "trending") {
        const categoryMap = {
            rooms: "room",
            "iconic cities": "city",
            mountains: "mountain",
            farms: "farm",
            arctic: "arctic",
            domes: "dome",
            boats: "boat",
            beach: "beach",
            luxury: "luxury",
            camping: "camp",
            castles: "castle",
        };

        const searchTerm = categoryMap[category.toLowerCase()];
        if (searchTerm) {
            query = {
                $or: [
                    { title: { $regex: searchTerm, $options: "i" } },
                    { description: { $regex: searchTerm, $options: "i" } },
                    { location: { $regex: searchTerm, $options: "i" } },
                    { country: { $regex: searchTerm, $options: "i" } },
                ],
            };
        }
    }

    const allListings = await Listing.find(query);
    res.render("listings/index.ejs", { allListings, category });
};

/* ================= NEW LISTING FORM ================= */
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

/* ================= SHOW LISTING ================= */
module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

/* ================= CREATE LISTING ================= */
module.exports.createListing = async (req, res) => {
    try {
        if (!req.file) {
            req.flash("error", "Image is required");
            return res.redirect("/listings/new");
        }

        let url = req.file.path;
        let filename = req.file.filename;

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        await newListing.save();
        req.flash("success", "New listing created successfully");
        res.redirect("/listings");
    } catch (err) {
        console.error(err);
        req.flash("error", "Error creating listing");
        res.redirect("/listings/new");
    }
};

/* ================= EDIT LISTING FORM ================= */
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url.replace(
        "/upload",
        "/upload/w_150,h_100"
    );

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

/* ================= UPDATE LISTING ================= */
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, {
        ...req.body.listing,
    });

    if (typeof req.file !== "undefined") {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
        await listing.save();
    }

    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
};

/* ================= DELETE LISTING ================= */
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
};

/* ================= CREATE BOOKING ================= */
module.exports.createBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkin, checkout, guests } = req.body;

        const startDate = new Date(checkin);
        const endDate = new Date(checkout);
        const today = new Date();

        if (startDate < today) {
            req.flash("error", "Check-in date cannot be in the past");
            return res.redirect(`/listings/${id}`);
        }

        if (endDate <= startDate) {
            req.flash("error", "Check-out must be after check-in");
            return res.redirect(`/listings/${id}`);
        }

        const guestCount = parseInt(guests);
        if (isNaN(guestCount) || guestCount < 1) {
            req.flash("error", "Invalid guest count");
            return res.redirect(`/listings/${id}`);
        }

        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        const days =
            (endDate.getTime() - startDate.getTime()) /
            (1000 * 3600 * 24);

        const totalPrice = Math.ceil(days) * listing.price;

        const booking = new Booking({
            listing: id,
            user: req.user._id,
            startDate,
            endDate,
            guests: guestCount,
            totalPrice,
        });

        await booking.save();

        req.flash("success", "Booking created successfully!");
        res.redirect("/bookings");
    } catch (err) {
        console.error(err);
        req.flash("error", "Error creating booking");
        res.redirect(`/listings/${req.params.id}`);
    }
};

module.exports.search = async (req, res) => {
  const { search } = req.body;

  if (!search || search.trim() === "") {
    return res.redirect("/listings"); // ✅ return added
  }

  const results = await Listing.find({
    $or: [
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } }
    ]
  });

  return res.render("listings/search", {
    results,
    searchQuery: search
  });
};
