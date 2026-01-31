const mongoose = require("mongoose");
const { Schema } = mongoose;
const Listing = require("./listing.js");

const bookingSchema = new mongoose.Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
        default: 'confirmed'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    specialRequests: String
});

module.exports = mongoose.model("Booking", bookingSchema);