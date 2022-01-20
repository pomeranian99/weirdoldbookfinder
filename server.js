const axios = require("axios");
const express = require("express");
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.text({type: 'text/xml'}));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "pug");

app.use(express.static("public"));

// app.get("/", async function(request, response) {
//  response.send("index.html");
// });

app.get("/", async function(request, response) {
  console.log("We got a pugtext query");
  response.render("index", { headline: "A pug page!", bookRetrieved: "xyYoAAAAYAAJ"});
});


app.post("/", async function(request, response) {
  // probably should have put all this logic into a separate function instead of leaving 
  // it here in the routing but i'm lazy and hey it works lol
  console.log("we got a bookme query!");
  console.log(request.body);
  let queryWeGot = request.body.searchText;
  console.log("the query we got is ..." + queryWeGot);
  let queryPhrase = queryWeGot.replace(/ /g, "+")
  let results = await bookMe(queryPhrase);
  let pre1924Books = [];
  for (let i = 0; i < results.data.items.length; i++) {
    if (Number(results.data.items[i].volumeInfo.publishedDate) < 1924) {
      pre1924Books.push(results.data.items[i].id)
    }
  }
  console.log(pre1924Books);
  let randoBook = pre1924Books[Math.floor(Math.random() * pre1924Books.length)];
  response.render("index", { bookRetrieved: randoBook });
});


const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

async function bookMe(x) {
  try {
    return await axios.get('https://www.googleapis.com/books/v1/volumes?q=' + x + '&filter=free-ebooks');
  } catch (err) {
    console.error(err);
  }
}