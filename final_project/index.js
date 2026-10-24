const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session configuration
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
  let token = null;

  // Retrieve token from session authorization object if available
  if (req.session && req.session.authorization) {
    token = req.session.authorization['accessToken'];
  }
  // Also support Authorization header (Bearer token) for flexibility
  else if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
  }

  if (token) {
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        if (!req.session.authorization) {
          req.session.authorization = {
            accessToken: token,
            username: user.data || user.username
          };
        }
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, '127.0.0.1', () => console.log("Server is running on port " + PORT));