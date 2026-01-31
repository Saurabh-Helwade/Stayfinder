const express = require("express");
const router = express.Router();
const passport = require("passport");

const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware.js");

// ✅ Correct controller path & naming
const usercontroller = require("../controllers/user.js");

/* ================= MIDDLEWARE ================= */
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    next();
}

/* ================= AUTH ROUTES ================= */
router.route("/signup")
    .get(usercontroller.renderSignupForm)
    .post(wrapAsync(usercontroller.signup));

router.route("/login")
    .get(usercontroller.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }),
        usercontroller.login
    );

router.get("/logout", usercontroller.logout);

/* ================= GOOGLE OAUTH ================= */
router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {
        req.flash("success", "Welcome to StayFinder via Google!");
        res.redirect("/listings");
    }
);

/* ================= PROFILE ================= */
router.route("/profile")
    .get(isLoggedIn, usercontroller.renderProfile);

router.route("/profile/edit")
    .get(isLoggedIn, usercontroller.renderEditProfile)
    .post(isLoggedIn, usercontroller.updateProfile)

/* ================= PAYMENT METHODS ================= */
router.route("/payment-methods")
    .get(isLoggedIn, usercontroller.renderPaymentMethods);

/* ================= WISHLIST ================= */
router.route("/wishlist")
    .get(isLoggedIn, usercontroller.renderWishlist);

router.post("/wishlist/:id", isLoggedIn, usercontroller.addToWishlist);
router.delete("/wishlist/:id", isLoggedIn, usercontroller.removeFromWishlist);

/* ================= NOTIFICATIONS ================= */
router.route("/notifications")
    .get(isLoggedIn, usercontroller.renderNotifications);

router.post(
    "/notifications/:id/read",
    isLoggedIn,
    usercontroller.markNotificationAsRead
);

/* ================= SETTINGS ================= */
router.route("/settings")
    .get(isLoggedIn, usercontroller.renderSettings)
    .post(isLoggedIn, usercontroller.updateSettings);

/* ================= BOOKINGS ================= */
router.get("/bookings", isLoggedIn, usercontroller.renderBookings);

router.get("/bookings/upcoming", isLoggedIn, usercontroller.renderUpcomingTrips);

router.get("/bookings/past", isLoggedIn, usercontroller.renderPastTrips);

router.get("/bookings/cancelled", isLoggedIn, usercontroller.renderCancelledTrips);

router.post(
    "/bookings/:id/cancel",
    isLoggedIn,
    usercontroller.cancelBooking
);
/* ================= INVOICES ================= */
router.route("/invoices")
    .get(isLoggedIn, usercontroller.renderInvoices);

/* ================= SUPPORT ================= */
router.route("/support")
    .get(isLoggedIn, usercontroller.renderSupport)
    .post(isLoggedIn, usercontroller.submitSupportTicket);

module.exports = router;
