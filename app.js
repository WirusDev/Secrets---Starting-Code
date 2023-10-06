//jshint esversion:6
import "dotenv/config";
import bcrypt from "bcrypt";
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";

const saltRounds = 10;

//import _ from "lodash";
import mongoose from "mongoose";
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

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username })
    .then((result) => {
      bcrypt.compare(password, result.password, function (err, result) {
        if (result === true) {
          res.render("secrets");
        } else {
          res.send(
            "<h1>Password of E-Mail is incorrect!<br><br> Please Try Again</h1>"
          );
        }

        // result == true
      });
    })
    .catch((error) => {
      res.send(
        "<h1>Password of E-Mail is incorrect!<br><br> Please Try Again</h1>"
      );
      console.log("Error code: ", error);
    });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });
    newUser
      .save()
      .then((result) => {
        console.log("Success!", result);
        res.render("secrets");
      })
      .catch((error) => {
        console.log("Error code: ", error);
      });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
