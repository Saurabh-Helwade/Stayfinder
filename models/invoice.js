const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceSchema = new mongoose.Schema({
    booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['paid', 'pending', 'refunded'],
        default: 'paid'
    },
    paymentMethod: {
        type: String,
        default: "N/A"
    },
    invoiceNumber: {
        type: String,
        unique: true
    }
});

// Generate unique invoice number before saving
invoiceSchema.pre('save', function(next) {
    if (!this.invoiceNumber) {
        this.invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);