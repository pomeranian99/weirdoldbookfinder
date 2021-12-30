console.log("send in the clowns");
// create an instance of the google books viewer
google.books.load();

const buttonPushed = document.querySelector("#searchButton");

function initialize() {
  var viewer = new google.books.DefaultViewer(
    document.getElementById("viewerCanvas")
  );
  viewer.load("6sLzOsk9F50C");
}

google.books.setOnLoadCallback(initialize);

buttonPushed.addEventListener("click", function(e) {
  // get the search term
  const searchValue = document.querySelector("#searchText").value;
  console.log("Button got pushed");
  document.getElementById("searchText").value = "";
  let searchTerm = searchValue.replace(" ", "_");
  runSearch(searchTerm);
});

function runSearch(searchTerm) {
  console.log("yeah bruh the term I got was " + searchTerm);
 
  /*
  fetch()
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      console.log(text);
    });
    */
}
