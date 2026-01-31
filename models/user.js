const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    /* ================= BASIC INFO ================= */

    email: {
      type: String,
      required: true,
      unique: true,
    },

    /* ================= GOOGLE OAUTH ================= */

    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows null while keeping uniqueness
    },

    /* ================= PROFILE ================= */

    phone: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    // 🔥 PROFILE IMAGE (NEW)
    avatar: {
      url: {
        type: String,
        default: "",
      },
      filename: {
        type: String,
        default: "",
      },
    },

    /* ================= USER PREFERENCES ================= */

    language: {
      type: String,
      default: "English",
    },

    currency: {
      type: String,
      default: "INR",
    },

    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },

    /* ================= WISHLIST ================= */

    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],

    /* ================= NOTIFICATIONS ================= */

    notifications: [
      {
        title: String,
        message: String,
        category: String,
        time: {
          type: Date,
          default: Date.now,
        },
        read: {
          type: Boolean,
          default: false,
        },
      },
    ],

    /* ================= PAYMENT METHODS ================= */

    paymentMethods: [
      {
        type: {
          type: String,
          enum: ["credit", "debit", "paypal", "upi"],
        },
        lastFour: String,
        expiry: String,
        provider: String,
      },
    ],
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

/* ================= PASSPORT LOCAL ================= */
// Adds: username, hash, salt, register(), authenticate()
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
