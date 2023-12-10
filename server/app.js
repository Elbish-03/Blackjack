const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { name } = require("ejs");
let gamesWon = 0;
let gamesLost = 0;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.use(express.static("../public"));

app.get("/game-data", (req, res) => {
  console.log("Sending game data...");
  res.json({ gamesWon: gamesWon, gamesLost: gamesLost });
});

app.post("/game-data", (req, res) => {
  console.log("Updating game data...");
  gamesWon = req.body.gamesWon;
  gamesLost = req.body.gamesLost;
  res.send("Game data updated.");
});

app.get("/game.js", (req, res) => {
  console.log("Serving game.js...");
  res.sendFile(__dirname + "/game.js");
});

app.get("/play", (req, res) => {
  res.render("play", {
    title: "My Web App",
  });
});

//Login und Register

mongoose.connect(
  "mongodb+srv://admin-elvis:kali@cluster0.sbjotar.mongodb.net/Blackjack",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home", {
    title: "My Web App",
  });
});

app.get("/linktoaccount", (req, res) => {
  res.render("account");
});
app.get("/linktoplay", (req, res) => {
  res.render("play");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send("User created successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send("Cannot find user");
    }

    if (await bcrypt.compare(password, user.password)) {
      const loginMessage = `Hello ${username}`;
      res.render("home", {
        title: "Login",
        loginMessage: loginMessage,
      });
    } else {
      res.status(401).send("Wrong username or password");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log("Server started"));
