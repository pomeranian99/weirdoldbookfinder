const axios = require("axios");
const express = require("express");
const app = express();

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

app.get("/", async function(request, response) {
  response.send("index.html");
});


app.get("/bookMe", async function(request, response) {
  let queryPhrase = request.query.words;
  let results = await bookMe(queryPhrase);
  // console.log(results.data.items);
  let pre1924Books = [];
  for (let i = 0; i < length.results.data.items; i++) {
    if (Number(results.data.items[i].volumeInfo.publishedDate) < 1924) {
      pre1924Books.push(results.data.items[i].id)
    }
  }
  console.log(pre1924Books);
  response.send(results.data.items[0].id);
});


const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});


async function bookMe(x) {
  try {
    return await axios.get('https://www.googleapis.com/books/v1/volumes?q=' + x);
  } catch (err) {
    console.error(err);
  }
}