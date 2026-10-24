const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is already registered
const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

// Check if username and password match records
const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

// Task 7 (Lab Task 7): Login as a registered user
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in. Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }

  // Generate JWT access token valid for 1 hour
  let accessToken = jwt.sign({
    data: username
  }, 'access', { expiresIn: 60 * 60 });

  // Store in session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: "User successfully logged in",
    token: accessToken
  });
});

// Task 8 (Lab Task 8): Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review || (req.body && req.body.review);
  const username = (req.session.authorization && req.session.authorization.username) || (req.user && (req.user.data || req.user.username));

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required (as query parameter ?review=... or JSON body)" });
  }

  // Add or modify review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "The review for the book with ISBN " + isbn + " has been added/updated.",
    reviews: books[isbn].reviews
  });
});

// Task 9 (Lab Task 9): Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = (req.session.authorization && req.session.authorization.username) || (req.user && (req.user.data || req.user.username));

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: "Reviews for the ISBN " + isbn + " posted by the user " + username + " deleted.",
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({
      message: "No review found for user " + username + " under ISBN " + isbn
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
