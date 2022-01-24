const jwt = require("jsonwebtoken");

const isLoggedIn = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "secret", (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        res.redirect("/login?status=tokenexpied");
      } else {
        // res.locals; buat variable jadi global
        res.locals.user = decodedToken.username;
        next();
      }
    });
  } else {
    res.locals.user = null;
    res.redirect("/login?status=tokennotexist");
  }

  next();
};

module.exports = isLoggedIn;
