const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Invoice = require("../models/invoice");

/* ================= HELPER ================= */
async function addNotification(userId, title, message, category) {
    const user = await User.findById(userId);
    if (!user) return;

    user.notifications.push({
        title,
        message,
        category,
        time: new Date(),
        read: false
    });

    await user.save();
}

/* ================= AUTH ================= */
module.exports.renderSignupForm = (req, res) => {
    res.render("user/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({ username, email });
        await User.register(newUser, password);

        req.login(newUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to StayFinder");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("user/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully");
        res.redirect("/listings");
    });
};

/* ================= PROFILE ================= */
module.exports.renderProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("user/profile.ejs", { user });
};

module.exports.renderEditProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("user/edit-profile.ejs", { user });
};

module.exports.updateProfile = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, req.body);
    req.flash("success", "Profile updated");
    res.redirect("/profile");
};

/* ================= PAYMENT ================= */
module.exports.renderPaymentMethods = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("user/payment-methods.ejs", { user });
};

/* ================= WISHLIST ================= */
module.exports.renderWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.render("user/wishlist.ejs", { user, listings: user.wishlist });
};

module.exports.addToWishlist = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { wishlist: req.params.id }
    });
    res.redirect(`/listings/${req.params.id}`);
};

module.exports.removeFromWishlist = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { wishlist: req.params.id }
    });
    res.redirect("/user/wishlist");
};

/* ================= NOTIFICATIONS ================= */
module.exports.renderNotifications = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("user/notifications.ejs", { notifications: user.notifications });
};

module.exports.markNotificationAsRead = async (req, res) => {
    const user = await User.findById(req.user._id);
    const notification = user.notifications.id(req.params.id);
    if (notification) notification.read = true;
    await user.save();
    res.redirect("/user/notifications");
};

/* ================= SETTINGS ================= */
module.exports.renderSettings = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("user/settings.ejs", { user });
};

module.exports.updateSettings = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, req.body);
    req.flash("success", "Settings updated");
    res.redirect("/settings");
};

/* ================= BOOKINGS ================= */
module.exports.renderBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.render("user/booking", { bookings });
};

module.exports.renderUpcomingTrips = async (req, res) => {
    const bookings = await Booking.find({
        user: req.user._id,
        status: "upcoming"
    }).populate("listing");

    res.render("user/upcoming-trips", { bookings });
};

module.exports.renderPastTrips = async (req, res) => {
    const bookings = await Booking.find({
        user: req.user._id,
        status: "completed"
    }).populate("listing");

    res.render("user/past-trips", { bookings });
};

module.exports.renderCancelledTrips = async (req, res) => {
    const bookings = await Booking.find({
        user: req.user._id,
        status: "cancelled"
    }).populate("listing");

    res.render("user/cancelled-trips", { bookings });
};

module.exports.cancelBooking = async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.id, {
        status: "cancelled"
    });

    req.flash("success", "Booking cancelled successfully");

    // ✅ redirect to cancelled trips page
    res.redirect("/bookings/cancelled");
};
/* ================= INVOICES ================= */
module.exports.renderInvoices = async (req, res) => {
    const invoices = await Invoice.find({ user: req.user._id });
    res.render("user/invoices.ejs", { invoices });
};

/* ================= SUPPORT ================= */
module.exports.renderSupport = async (req, res) => {
    res.render("user/support.ejs");
};

module.exports.submitSupportTicket = async (req, res) => {
    req.flash("success", "Support ticket submitted");
    res.redirect("/user/support");
};
