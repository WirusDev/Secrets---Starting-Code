//jshint esversion:6
import bodyParser from "body-parser";
import "dotenv/config";
import ejs from "ejs";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

//import _ from "lodash";

// sudo npm i express body-parser ejs lodash mongoose

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

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
});

const User = new mongoose.model("User", userSchema);

//Schema END--------------------

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", (req, res) => {});

app.post("/register", (req, res) => {});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
