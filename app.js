if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("./models/user.js");
const Listing = require("./models/listing.js");

/* ================= ROUTES ================= */
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const categoryRouter = require("./routes/category.js");
const searchRouter = require("./routes/search.js");

/* ================= DATABASE ================= */
const dbUrl =
  process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/stayfinder";

mongoose
  .connect(dbUrl)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const count = await Listing.countDocuments();
    if (count === 0) {
      console.log("📦 Initializing database with sample data...");
      const { initDB } = require("./init/index.js");
      await initDB();
      console.log("✅ Database initialized");
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

/* ================= APP CONFIG ================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

/* ================= SESSION STORE ================= */
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET || "mysupersecretcode",
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("❌ Mongo Session Store Error", err);
});

const sessionOptions = {
  store,
  name: "stayfinder-session",
  secret: process.env.SESSION_SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

/* ================= PASSPORT ================= */
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            username:
              profile.displayName ||
              profile.emails[0].value.split("@")[0],
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ================= GLOBAL LOCALS (🔥 CRITICAL FIX) ================= */

// 👇 This line prevents navbar.ejs crash FOREVER
app.locals.currUser = null;

app.use((req, res, next) => {
  res.locals.currUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

/* ================= ROUTES ================= */

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/search", searchRouter);

/* ================= ERROR HANDLING ================= */

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
