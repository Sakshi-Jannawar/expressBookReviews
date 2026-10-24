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
 * Task 10: Get all books using async/await with Axios
 * @returns {Promise<any>} Resolves with full book catalog data
 */
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Task 10: Get all books using Promise callbacks with Axios
 * @returns {Promise<any>} Resolves with full book catalog data
 */
function getAllBooksPromise() {
  return new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * Task 11: Get book details based on ISBN using Promise callbacks with Axios
 * @param {string|number} isbn - The ISBN of the requested book
 * @returns {Promise<any>} Resolves with book details
 */
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * Task 11: Get book details based on ISBN using async/await with Axios
 * @param {string|number} isbn - The ISBN of the requested book
 * @returns {Promise<any>} Resolves with book details
 */
async function getBookByISBNAsync(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Task 12: Get book details based on Author using async/await with Axios
 * @param {string} author - The author name to filter by
 * @returns {Promise<any>} Resolves with list of matching books
 */
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Task 12: Get book details based on Author using Promise callbacks with Axios
 * @param {string} author - The author name to filter by
 * @returns {Promise<any>} Resolves with list of matching books
 */
function getBooksByAuthorPromise(author) {
  return new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * Task 13: Get book details based on Title using async/await with Axios
 * @param {string} title - The title to filter by
 * @returns {Promise<any>} Resolves with list of matching books
 */
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Task 13: Get book details based on Title using Promise callbacks with Axios
 * @param {string} title - The title to filter by
 * @returns {Promise<any>} Resolves with list of matching books
 */
function getBooksByTitlePromise(title) {
  return new Promise((resolve, reject) => {
    axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

// Generic helpers for arbitrary endpoints
function getBookListWithPromise(url) {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

async function getBookListAsync(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * Task 10 Routes: Get all books using Promise / async-await
 * ------------------------------------------------------------------ */
public_users.get('/promise', function (req, res) {
  getAllBooksPromise()
    .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
    .catch((error) => res.status(500).json({ message: "Error retrieving book list with Promise", error: error.message }));
});

public_users.get('/async', async function (req, res) {
  try {
    const bookList = await getAllBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list with async/await", error: error.message });
  }
});

public_users.get('/async/books', async function (req, res) {
  try {
    const bookList = await getAllBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list with async/await", error: error.message });
  }
});

/* ------------------------------------------------------------------ *
 * Task 11 Routes: Get book details based on ISBN using Promise / async-await
 * ------------------------------------------------------------------ */
public_users.get('/promise/isbn/:isbn', function (req, res) {
  getBookByISBN(req.params.isbn)
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((error) => res.status(500).json({ message: "Error retrieving book by ISBN with Promise", error: error.message }));
});

public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const book = await getBookByISBNAsync(req.params.isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book by ISBN with async/await", error: error.message });
  }
});

/* ------------------------------------------------------------------ *
 * Task 12 Routes: Get book details based on Author using Promise / async-await
 * ------------------------------------------------------------------ */
public_users.get('/promise/author/:author', function (req, res) {
  getBooksByAuthorPromise(req.params.author)
    .then((booksByAuthor) => res.status(200).send(JSON.stringify(booksByAuthor, null, 4)))
    .catch((error) => res.status(500).json({ message: "Error retrieving books by author with Promise", error: error.message }));
});

public_users.get('/async/author/:author', async function (req, res) {
  try {
    const booksByAuthor = await getBooksByAuthor(req.params.author);
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by author with async/await", error: error.message });
  }
});

/* ------------------------------------------------------------------ *
 * Task 13 Routes: Get all books based on Title using Promise / async-await
 * ------------------------------------------------------------------ */
public_users.get('/promise/title/:title', function (req, res) {
  getBooksByTitlePromise(req.params.title)
    .then((booksByTitle) => res.status(200).send(JSON.stringify(booksByTitle, null, 4)))
    .catch((error) => res.status(500).json({ message: "Error retrieving books by title with Promise", error: error.message }));
});

public_users.get('/async/title/:title', async function (req, res) {
  try {
    const booksByTitle = await getBooksByTitle(req.params.title);
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by title with async/await", error: error.message });
  }
});

module.exports = {
  general: public_users,
  getAllBooks,
  getAllBooksPromise,
  getAllBooksAxios: getAllBooks,
  getBookByISBN,
  getBookByIsbn: getBookByISBN,
  getBookByISBNAsync,
  getBookByIsbnAsync: getBookByISBNAsync,
  getBookByIsbnAxios: getBookByISBN,
  getBooksByAuthor,
  getBooksByAuthorPromise,
  getBooksByAuthorAsync: getBooksByAuthor,
  getBooksByAuthorAxios: getBooksByAuthor,
  getBooksByTitle,
  getBooksByTitlePromise,
  getBooksByTitleAsync: getBooksByTitle,
  getBooksByTitleAxios: getBooksByTitle,
  getBookListWithPromise,
  getBookListAsync
};
module.exports.general = public_users;
