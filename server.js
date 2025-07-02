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
  response.render("index", { bookRetrieved: "xyYoAAAAYAAJ", success: true});
  // response.render("index2");
});

// validate that the search request is alphanumeric only, with whitespace and apostrophes allowed
app.post("/", check('searchText').isAlphanumeric('en-US', {ignore: ' '}), async function(request, response) {
  // first, find any validation errors
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
      return response.render("index", { bookRetrieved: "xyYoAAAAYAAJ", errors: true, success: true});
    }
  
  // I should have put all this logic into a separate function instead of leaving 
  // it here in the routing like a messy basement but i'm laaaazy and hey it works lol
  let success = false;
  let queryWeGot = request.body.searchText;
  let queryPhrase = queryWeGot.replace(/ /g, "+")
  let results = await bookMe(queryPhrase);
  let pre1924Books = [];
  // pull out only the books published before 1924
  for (let i = 0; i < results.data.items.length; i++) {
    if (Number(results.data.items[i].volumeInfo.publishedDate) < 1924) {
      pre1924Books.push(results.data.items[i].id)
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
  response.render("index", { bookRetrieved: randoBook, success: success, errors: false });
});

// Change this part for Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
}

async function bookMe(x) {
  try {
    return await axios.get('https://www.googleapis.com/books/v1/volumes?q=' + x + '&filter=free-ebooks');
  } catch (err) {
    console.error(err);
  }
}

// Export the app for Vercel
module.exports = app;