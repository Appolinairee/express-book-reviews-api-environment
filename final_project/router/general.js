const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn]);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];

  for (let isbn in books) {
    if (books[isbn].author === author) {
      booksByAuthor.push({ isbn: isbn, ...books[isbn] });
    }
  }

  if (booksByAuthor.length > 0) {
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];

  for (let isbn in books) {
    if (books[isbn].title === title) {
      booksByTitle.push({ isbn: isbn, ...books[isbn] });
    }
  }

  if (booksByTitle.length > 0) {
    res.send(JSON.stringify(booksByTitle, null, 4));
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 10: Get all books using async callback
const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};

public_users.get("/async", function (req, res) {
  getAllBooks()
    .then((booksList) => res.send(JSON.stringify(booksList, null, 4)))
    .catch((error) =>
      res.status(500).json({ message: "Error retrieving books" })
    );
});

// Task 11: Get book by ISBN using promises
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });
};

public_users.get("/async/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  getBookByISBN(isbn)
    .then((book) => res.send(book))
    .catch((error) => res.status(404).json({ message: error }));
});

// Task 12: Get books by author using async-await
const getBooksByAuthor = async (author) => {
  return new Promise((resolve, reject) => {
    let booksByAuthor = [];
    for (let isbn in books) {
      if (books[isbn].author === author) {
        booksByAuthor.push({ isbn: isbn, ...books[isbn] });
      }
    }
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("No books found by this author");
    }
  });
};

public_users.get("/async/author/:author", async function (req, res) {
  const author = req.params.author;
  try {
    const booksList = await getBooksByAuthor(author);
    res.send(JSON.stringify(booksList, null, 4));
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Task 13: Get books by title using async-await
const getBooksByTitle = async (title) => {
  return new Promise((resolve, reject) => {
    let booksByTitle = [];
    for (let isbn in books) {
      if (books[isbn].title === title) {
        booksByTitle.push({ isbn: isbn, ...books[isbn] });
      }
    }
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("No books found with this title");
    }
  });
};

public_users.get("/async/title/:title", async function (req, res) {
  const title = req.params.title;
  try {
    const booksList = await getBooksByTitle(title);
    res.send(JSON.stringify(booksList, null, 4));
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

module.exports.general = public_users;
