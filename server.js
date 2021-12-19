const axios = require("axios");
const express = require("express");
const app = express();

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

app.get("/", async function(request, response) {
  console.log("the get function has fired");
  response.send("index.html");
});


app.get("/bookme", async function(request, response) {
  console.log("the bookme function has fired");
  response.send("index.html");
});



const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});


async function bookMe() {
  try {
    return await axios.get('https://www.googleapis.com/books/v1/volumes?q=machinery+silly&filter=free-ebooks');
  } catch (err) {
    console.error(err);
  }
  // https://www.googleapis.com/books/v1/volumes?q=machinery+silly&filter=free-ebooks
}