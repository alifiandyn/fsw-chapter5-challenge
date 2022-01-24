const express = require("express");
const app = express();
const fs = require("fs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const isLoggedIn = require("./middleware/authMiddleware");

app.set("view engine", "ejs");
app.set("views", __dirname + "/public/views");

app.use(express.static(__dirname + "/public/"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.get("/", isLoggedIn, (req, res) => {
app.get("/", (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "secret", (err, decodedToken) => {
      if (err) {
        res.render("index", {
          pageTitle: "Traditional Games",
          user: "",
        });
      } else {
        res.render("index", {
          pageTitle: "Traditional Games",
          user: decodedToken.username,
        });
      }
    });
  } else {
    res.render("index", {
      pageTitle: "Traditional Games",
      user: "",
    });
  }
});

app.get("/login", (req, res) => {
  const status = req.query.status;
  if (!status) {
    res.render("login", { pageTitle: "Login", loginMessage: "Welcome, please login to start the game" });
  } else {
    if (status == "usernamenotfound") {
      res.render("login", { pageTitle: "Login", loginMessage: "Username not found, please input the correct username" });
    } else {
      if (status == "wrongpassword") {
        res.render("login", { pageTitle: "Login", loginMessage: "Wrong password, please input the correct password" });
      } else {
        if (status == "successlogout") {
          res.render("login", { pageTitle: "Login", loginMessage: "Success logout" });
        } else {
          if (status == "tokenexpied") {
            res.render("login", { pageTitle: "Login", loginMessage: "Your session has expied, please login to start the game" });
          } else {
            res.render("login", { pageTitle: "Login", loginMessage: "You are not logged in, please login to start the game" });
          }
        }
      }
    }
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const dataUser = JSON.parse(fs.readFileSync("./data/user.json", "utf-8"));
  const userMatch = dataUser.find((item) => {
    return item.username == username;
  });

  if (!userMatch) {
    res.redirect("/login?status=usernamenotfound");
  } else {
    if (password == userMatch.password) {
      const token = jwt.sign(
        {
          id: userMatch.id,
          username: userMatch.username,
        },
        "secret",
        { expiresIn: 60 * 60 * 24 } //satuan detik, bawaan jsonwebtoken
      );
      res.cookie("jwt", token, { maxAge: 1000 * 60 * 60 * 24 }); //satuan milisekon, bawaan cookie-parser
      res.redirect("/game");
    } else {
      res.redirect("/login?status=wrongpassword");
    }
  }
});

app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.redirect("/login?status=successlogout");
});

app.get("/signup", (req, res) => {
  res.render("signup", { pageTitle: "Sign Up" });
});

app.get("/game", isLoggedIn, (req, res) => {
  res.render("game", { pageTitle: "Rock Paper Scissors" });
});

const PORT = 2998;
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
