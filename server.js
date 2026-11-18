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

// the fallback book we show when there's nothing else to show (no search yet,
// or a search that came up empty) -- a public-domain hunting & fishing guide
const DEFAULT_BOOK_ID = "xyYoAAAAYAAJ";

app.get("/", async function(request, response) {
  let pdfInfo = await getPdfInfo(DEFAULT_BOOK_ID);
  response.render("index", { bookRetrieved: DEFAULT_BOOK_ID, success: true, errors: false, apiFailure: false, ...pdfInfo });
  // response.render("index2");
});

// validate that the search request is alphanumeric only, with whitespace and apostrophes allowed
app.post("/", check('searchText').isAlphanumeric('en-US', {ignore: ' '}), async function(request, response) {
  // first, find any validation errors
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
      let pdfInfo = await getPdfInfo(DEFAULT_BOOK_ID);
      return response.render("index", { bookRetrieved: DEFAULT_BOOK_ID, errors: true, success: true, apiFailure: false, ...pdfInfo });
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
    randoBook = DEFAULT_BOOK_ID;
  } else {
    // otherwise, pick a random book from the results we got from Google books
    success = true;
    randoBook = pre1924Books[Math.floor(Math.random() * pre1924Books.length)];
  }
  // accessInfo.pdf on a /volumes *search* result item is unreliable (it can say
  // isAvailable: false for a book that does have a PDF) -- so rather than trust
  // the data we already got back in `items`, look up the one book we're actually
  // showing, straight from Google, for an accurate answer. Skip it entirely if
  // bookMe() already told us the API is down -- no point in a second doomed call.
  let pdfInfo = apiFailure ? { pdfAvailable: false, pdfLink: null } : await getPdfInfo(randoBook);
  response.render("index", { bookRetrieved: randoBook, success: success, errors: false, apiFailure: apiFailure, ...pdfInfo });
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

// pull the PDF download info out of a single Google Books volume lookup response.
// Public-domain books usually have a PDF, but not always (some are scan-only /
// view-only), so this always returns a shape the template can rely on either way.
function extractPdfInfo(volume) {
  let pdf = volume && volume.accessInfo && volume.accessInfo.pdf;
  if (pdf && pdf.isAvailable && pdf.downloadLink) {
    // upgrade to https -- Google serves it fine over TLS, this just avoids a
    // "not secure" address bar warning when the link is opened
    return { pdfAvailable: true, pdfLink: pdf.downloadLink.replace(/^http:\/\//, 'https://') };
  }
  return { pdfAvailable: false, pdfLink: null };
}

// look up a single book by id and report whether it has a downloadable PDF.
// We always hit the single-volume endpoint for this (rather than trusting
// accessInfo.pdf off a /volumes *search* result) because the search endpoint's
// per-item accessInfo has been observed to report isAvailable: false for books
// that do in fact have a PDF -- this endpoint is the accurate source.
async function getPdfInfo(bookId) {
  try {
    let result = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`, {
      params: { key: process.env.GOOGLE_BOOKS_API_KEY }
    });
    return extractPdfInfo(result.data);
  } catch (err) {
    console.error(err);
    return { pdfAvailable: false, pdfLink: null };
  }
}

// Export the app for Vercel
module.exports = app;