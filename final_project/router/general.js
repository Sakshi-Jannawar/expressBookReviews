const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://127.0.0.1:5000";

/* ------------------------------------------------------------------ *
 * Task 6 (Submission Task 7): Register a new user
 * Validates that username and password are provided and that username
 * does not already exist before registering.
 * ------------------------------------------------------------------ */
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

/* ------------------------------------------------------------------ *
 * Task 1: Get the list of books available in the shop
 * Returns the entire book catalog as a formatted JSON response.
 * ------------------------------------------------------------------ */
public_users.get('/', function (req, res) {
  try {
    return res.status(200).send(JSON.stringify(books, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list", error: error.message });
  }
});

/* ------------------------------------------------------------------ *
 * Task 2: Get book details based on ISBN
 * Retrieves a single book by matching its ISBN key in the catalog.
 * ------------------------------------------------------------------ */
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).json({ message: "Book with ISBN " + isbn + " not found" });
  }
});

/* ------------------------------------------------------------------ *
 * Task 3: Get book details based on Author
 * Filters and returns all books matching the specified author name.
 * ------------------------------------------------------------------ */
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  let filteredBooks = {};

  const keys = Object.keys(books);
  keys.forEach((key) => {
    if (books[key].author.toLowerCase() === author) {
      filteredBooks[key] = books[key];
    }
  });

  if (Object.keys(filteredBooks).length > 0) {
    return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
  } else {
    return res.status(404).json({ message: "No books found by author " + req.params.author });
  }
});

/* ------------------------------------------------------------------ *
 * Task 4: Get all books based on Title
 * Filters and returns all books matching the specified title.
 * ------------------------------------------------------------------ */
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  let filteredBooks = {};

  const keys = Object.keys(books);
  keys.forEach((key) => {
    if (books[key].title.toLowerCase() === title) {
      filteredBooks[key] = books[key];
    }
  });

  if (Object.keys(filteredBooks).length > 0) {
    return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
  } else {
    return res.status(404).json({ message: "No books found with title " + req.params.title });
  }
});

/* ------------------------------------------------------------------ *
 * Task 5 (Submission Task 6): Get book reviews based on ISBN
 * Returns the reviews object for the requested book ISBN.
 * ------------------------------------------------------------------ */
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book with ISBN " + isbn + " not found" });
  }
});

/* ================================================================== *
 * TASKS 10 - 13: ASYNCHRONOUS OPERATIONS USING AXIOS
 * Helper functions and endpoints utilizing Promise callbacks (.then/.catch)
 * and async/await syntax to asynchronously fetch book details.
 * ================================================================== */

/**
 * Asynchronously fetch book data from a given URL using Promise callbacks.
 * @param {string} url - Target URL endpoint
 * @returns {Promise} Resolves with response data or rejects with error
 */
function getBookListWithPromise(url) {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * Asynchronously fetch book data from a given URL using async/await.
 * @param {string} url - Target URL endpoint
 * @returns {Promise<any>} Resolves with response data
 */
async function getBookListAsync(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * Task 10: Get all books using Promise callbacks & async/await with Axios
 * ------------------------------------------------------------------ */

// Task 10 With Promise callbacks
public_users.get('/promise', function (req, res) {
  getBookListWithPromise(`${BASE_URL}/`)
    .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
    .catch((error) => res.status(500).json({ message: "Error retrieving book list with Promise", error: error.message }));
});

// Task 10 With async/await
public_users.get('/async', async function (req, res) {
  try {
    const bookList = await getBookListAsync(`${BASE_URL}/`);
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list with async/await", error: error.message });
  }
});

/* ------------------------------------------------------------------ *
 * Task 11: Get book details based on ISBN using Promise callbacks & async/await with Axios
 * ------------------------------------------------------------------ */

// Task 11 With Promise callbacks
public_users.get('/promise/isbn/:isbn', function (req, res) {
  const requestedIsbn = req.params.isbn;
  getBookListWithPromise(`${BASE_URL}/isbn/${encodeURIComponent(requestedIsbn)}`)
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((error) => res.status(500).json({ message: "Error retrieving book by ISBN with Promise", error: error.message }));
});

// Task 11 With async/await
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const requestedIsbn = req.params.isbn;
    const book = await getBookListAsync(`${BASE_URL}/isbn/${encodeURIComponent(requestedIsbn)}`);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book by ISBN with async/await", error: error.message });
  }
});

/* ------------------------------------------------------------------ *
 * Task 12: Get book details based on Author using Promise callbacks & async/await with Axios
 * ------------------------------------------------------------------ */

// Task 12 With Promise callbacks
public_users.get('/promise/author/:author', function (req, res) {
  const requestedAuthor = req.params.author;
  getBookListWithPromise(`${BASE_URL}/author/${encodeURIComponent(requestedAuthor)}`)
    .then((booksByAuthor) => res.status(200).send(JSON.stringify(booksByAuthor, null, 4)))
    .catch((error) => res.status(500).json({ message: "Error retrieving books by author with Promise", error: error.message }));
});

// Task 12 With async/await
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const requestedAuthor = req.params.author;
    const booksByAuthor = await getBookListAsync(`${BASE_URL}/author/${encodeURIComponent(requestedAuthor)}`);
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by author with async/await", error: error.message });
  }
});

/* ------------------------------------------------------------------ *
 * Task 13: Get all books based on Title using Promise callbacks & async/await with Axios
 * ------------------------------------------------------------------ */

// Task 13 With Promise callbacks
public_users.get('/promise/title/:title', function (req, res) {
  const requestedTitle = req.params.title;
  getBookListWithPromise(`${BASE_URL}/title/${encodeURIComponent(requestedTitle)}`)
    .then((booksByTitle) => res.status(200).send(JSON.stringify(booksByTitle, null, 4)))
    .catch((error) => res.status(500).json({ message: "Error retrieving books by title with Promise", error: error.message }));
});

// Task 13 With async/await
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const requestedTitle = req.params.title;
    const booksByTitle = await getBookListAsync(`${BASE_URL}/title/${encodeURIComponent(requestedTitle)}`);
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by title with async/await", error: error.message });
  }
});

module.exports = {
  general: public_users,
  getBookListWithPromise,
  getBookListAsync
};
