import bodyParser from "body-parser";
import "dotenv/config";
import ejs from "ejs";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import findOrCreate from "mongoose-findorcreate";
import passport from "passport";
import FacebookStrategy from "passport-facebook";
import GoogleStrategy from "passport-google-oauth20";
import LocalStrategy from "passport-local";
import passportLocalMongoose from "passport-local-mongoose";
//import _ from "lodash";

// sudo npm i express body-parser ejs lodash mongoose

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "My secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Connection URL
const dbName = "userDB";
const url = `mongodb://192.168.50.117:27017/${dbName}`; // Replace with your MongoDB server URL, port, and database name

// Connect to MongoDB
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a connection object
const db = mongoose.connection;

// Event listeners for successful and error connections
db.on("connected", () => {
  console.log("Connected to MongoDB");
});

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Define your Mongoose schemas and models here

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  facebookId: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

//Schema END--------------------

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

//Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID_GOOGLE,
      clientSecret: process.env.CLIENT_SECRET_GOOGLE,
      callbackURL: "http://localhost:3000/auth/google/secrets",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

//Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.CLIENT_ID_FACEBOOK,
      clientSecret: process.env.CLIENT_SECRET_FACEBOOK,
      callbackURL: "http://localhost:3000/auth/facebook/secrets",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  }
);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/secrets",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  }
);

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),

  function (req, res) {
    res.redirect("/secrets");
  }
);

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  User.register(new User({ username }), password, (err, user) => {
    if (err) {
      console.log(err);
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, () => {
      res.redirect("/secrets");
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
