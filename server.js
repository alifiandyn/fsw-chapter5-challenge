const express = require("express");
const app = express();
const fs = require("fs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const isLoggedIn = require("./middleware/authMiddleware");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { query } = require("express");

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
            if (status == "signupsuccess") {
              res.render("login", { pageTitle: "Login", loginMessage: "Your account has been created successfully, please login to start the game" });
            } else {
              res.render("login", { pageTitle: "Login", loginMessage: "You are not logged in, please login to start the game" });
            }
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
    const passwordVerify = bcrypt.compareSync(password, userMatch.passwordHash);
    if (passwordVerify == true) {
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
  const status = req.query.status;
  if (!status) {
    res.render("signup", { pageTitle: "Sign Up", loginMessage: "" });
  } else {
    if (status == "usernamealreadyexist") {
      res.render("signup", { pageTitle: "Sign Up", loginMessage: "The username you entered is already registered, please enter a new username" });
    } else {
      if (status == "passwordnotmatch") {
        res.render("signup", { pageTitle: "Sign Up", loginMessage: "Password you entered is not match, please try again" });
      } else {
        res.render("login", { pageTitle: "Login", loginMessage: "Your account has been created successfully" });
      }
    }
  }
});

app.post("/signup", (req, res) => {
  const { username, password, confirmPassword } = req.body;
  const data = fs.readFileSync("./data/user.json", "utf-8");
  const dataUser = JSON.parse(data);

  const userMatch = dataUser.find((item) => {
    return item.username == username;
  });

  if (userMatch) {
    res.redirect("/signup?status=usernamealreadyexist");
  } else {
    if (password != confirmPassword) {
      res.redirect("/signup?status=passwordnotmatch");
    } else {
      const salt = bcrypt.genSaltSync(16);
      const passwordHash = bcrypt.hashSync(password, salt);
      const newUser = {
        id: uuidv4(),
        username,
        passwordHash,
      };
      dataUser.push(newUser);
      fs.writeFileSync("./data/user.json", JSON.stringify(dataUser, null, 4));
      res.redirect("/login?status=signupsuccess");
    }
  }
});

app.get("/game", isLoggedIn, (req, res) => {
  res.render("game", { pageTitle: "Rock Paper Scissors" });
});

const PORT = 2998;
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
