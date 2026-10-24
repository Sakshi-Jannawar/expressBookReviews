const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://127.0.0.1:5000";

/* ------------------------------------------------------------------ *
 * Task 6 (Lab Task 6 / Submission Task 7): Register a new user
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
 * Task 1 & Task 10: Get the list of books available in the shop
 * Implemented using Promise callbacks / Async-Await
 * ------------------------------------------------------------------ */
public_users.get('/', async function (req, res) {
  try {
    const getBooks = new Promise((resolve) => {
      resolve(books);
    });
    const bookList = await getBooks;
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

/* ------------------------------------------------------------------ *
 * Task 2 & Task 11: Get book details based on ISBN
 * Implemented using Promises with .then() and .catch()
 * ------------------------------------------------------------------ */
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const findBookByIsbn = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book with ISBN " + isbn + " not found" });
    }
  });

  findBookByIsbn
    .then((book) => {
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});

/* ------------------------------------------------------------------ *
 * Task 3 & Task 12: Get book details based on Author
 * Implemented using Async-Await with Promise
 * ------------------------------------------------------------------ */
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const findBooksByAuthor = new Promise((resolve, reject) => {
      let filteredBooks = {};
      const keys = Object.keys(books);
      keys.forEach((key) => {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          filteredBooks[key] = books[key];
        }
      });

      if (Object.keys(filteredBooks).length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ status: 404, message: "No books found by author " + author });
      }
    });

    const booksByAuthor = await findBooksByAuthor;
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

/* ------------------------------------------------------------------ *
 * Task 4 & Task 13: Get all books based on Title
 * Implemented using Async-Await with Promise
 * ------------------------------------------------------------------ */
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const findBooksByTitle = new Promise((resolve, reject) => {
      let filteredBooks = {};
      const keys = Object.keys(books);
      keys.forEach((key) => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          filteredBooks[key] = books[key];
        }
      });

      if (Object.keys(filteredBooks).length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ status: 404, message: "No books found with title " + title });
      }
    });

    const booksByTitle = await findBooksByTitle;
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

/* ------------------------------------------------------------------ *
 * Task 5 (Submission Task 6): Get book reviews based on ISBN
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
 * TASKS 10 - 13: Asynchronous Implementation using Axios
 * Demonstrates consuming endpoints with Promise callbacks & async/await
 * ================================================================== */

// Task 10: Get all books using async/await with Axios
const getAllBooksAxios = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Task 11: Get book details based on ISBN using Promises with Axios
const getBookByIsbnAxios = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
};

// Task 12: Get book details based on Author using async/await with Axios
const getBooksByAuthorAxios = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Task 13: Get book details based on Title using async/await with Axios
const getBooksByTitleAxios = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Dedicated routes to test the Axios implementations directly
public_users.get('/async/books', async function (req, res) {
  try {
    const data = await getAllBooksAxios();
    return res.status(200).send(JSON.stringify(data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Axios error fetching books", error: error.message });
  }
});

public_users.get('/async/isbn/:isbn', function (req, res) {
  getBookByIsbnAxios(req.params.isbn)
    .then((data) => res.status(200).send(JSON.stringify(data, null, 4)))
    .catch((error) => res.status(500).json({ message: "Axios error fetching book by ISBN", error: error.message }));
});

public_users.get('/async/author/:author', async function (req, res) {
  try {
    const data = await getBooksByAuthorAxios(req.params.author);
    return res.status(200).send(JSON.stringify(data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Axios error fetching books by author", error: error.message });
  }
});

public_users.get('/async/title/:title', async function (req, res) {
  try {
    const data = await getBooksByTitleAxios(req.params.title);
    return res.status(200).send(JSON.stringify(data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Axios error fetching books by title", error: error.message });
  }
});

module.exports.general = public_users;
module.exports.getAllBooksAxios = getAllBooksAxios;
module.exports.getBookByIsbnAxios = getBookByIsbnAxios;
module.exports.getBooksByAuthorAxios = getBooksByAuthorAxios;
module.exports.getBooksByTitleAxios = getBooksByTitleAxios;
