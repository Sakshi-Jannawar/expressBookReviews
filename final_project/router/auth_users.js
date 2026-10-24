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

// Task 7 / Task 8: Login as a registered user
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in. Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Store in session
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).send("Customer successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 8 / Task 9: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review || (req.body && req.body.review);
  const username = (req.session.authorization && req.session.authorization.username) || (req.user && (req.user.data || req.user.username));

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Add or modify review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "The review for the book with ISBN " + isbn + " has been added/updated.",
    reviews: books[isbn].reviews
  });
});

// Task 9 / Task 10: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = (req.session.authorization && req.session.authorization.username) || (req.user && (req.user.data || req.user.username));

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).send(`Review for the ISBN ${isbn} is deleted.`);
  } else {
    return res.status(404).json({ message: "Review not found for user " + username });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
