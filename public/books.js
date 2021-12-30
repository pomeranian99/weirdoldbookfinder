// create an instance of the google books viewer
google.books.load();

const buttonPushed = document.querySelector("#searchButton");

function initialize() {
  var viewer = new google.books.DefaultViewer(
    document.getElementById("viewerCanvas")
  );
  viewer.load("xyYoAAAAYAAJ");
}

google.books.setOnLoadCallback(initialize);

buttonPushed.addEventListener("click", function(e) {
  const searchValue = document.querySelector("#searchText").value;
  document.getElementById("searchText").value = "";
  let searchTerm = searchValue.replace(/ /g, "+");
  runSearch(searchTerm);
});

function runSearch(searchTerm) {
  console.log("yeah bruh the term I got was " + searchTerm);
  let url =
    "https://weird-old-book-finder.glitch.me/bookMe?words=" + searchTerm;
  console.log("I'm gonna send the url query ... " + url);

  fetch(url)
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      console.log(text);
      var viewer = new google.books.DefaultViewer(
        document.getElementById("viewerCanvas")
      );
      viewer.load(text);
    });
}
