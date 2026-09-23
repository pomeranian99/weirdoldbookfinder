const axios = require("axios");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
app.use(bodyParser.json());
app.use(bodyParser.text({type: 'text/xml'}));
app.use(bodyParser.urlencoded({
  extended: true
}));

var errors;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use(express.static("public"));

app.get("/", async function(request, response) {
  response.render("index", { bookRetrieved: "xyYoAAAAYAAJ", success: true, errors: false, apiFailure: false });
  // response.render("index2");
});

// validate that the search request is alphanumeric only, with whitespace and apostrophes allowed
app.post("/", check('searchText').isAlphanumeric('en-US', {ignore: ' '}), async function(request, response) {
  // first, find any validation errors
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
      return response.render("index", { bookRetrieved: "xyYoAAAAYAAJ", errors: true, success: true, apiFailure: false });
    }

  // I should have put all this logic into a separate function instead of leaving
  // it here in the routing like a messy basement but i'm laaaazy and hey it works lol
  let success = false;
  let queryWeGot = request.body.searchText;
  let results = await bookMe(queryWeGot);

  // bookMe() returns undefined if the call to Google Books blew up (bad/missing key, quota
  // exceeded, network hiccup, etc). That's different from a legit "no matches" -- tell the
  // difference so the page can say something more useful than just spinning forever.
  let apiFailure = !results;
  let items = (results && results.data && results.data.items) || [];

  let pre1924Books = [];
  // pull out only the books published before 1924
  for (let i = 0; i < items.length; i++) {
    // parseInt, not Number -- Google often sends publishedDate as "1902-05-01" or "1902-05"
    // rather than a bare year, and Number() of those is NaN (so they'd get silently dropped)
    if (parseInt(items[i].volumeInfo.publishedDate, 10) < 1924) {
      pre1924Books.push(items[i].id)
    }
  }
  let randoBook;
  // if we get *no* results from google books, then return the 'hunting and fishing' book
  if (pre1924Books.length < 1) {
    randoBook = "xyYoAAAAYAAJ";
  } else {
    // otherwise, pick a random book from the results we got from Google books
    success = true;
    randoBook = pre1924Books[Math.floor(Math.random() * pre1924Books.length)];
  }
  response.render("index", { bookRetrieved: randoBook, success: success, errors: false, apiFailure: apiFailure });
});

// Change this part for Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
}

async function bookMe(x) {
  try {
    // as of 2026, Google Books requires an API key for every request -- keyless calls
    // now get a hard 429 "quota exceeded" (the shared anonymous quota was set to 0)
    return await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: x,
        filter: 'free-ebooks',
        key: process.env.GOOGLE_BOOKS_API_KEY
      }
    });
  } catch (err) {
    console.error(err);
    // swallow it -- the caller treats a missing result as "couldn't reach the API"
  }
}

// Export the app for Vercel
module.exports = app;