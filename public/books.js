console.log("send in the clowns");
// create an instance of the google books viewer
google.books.load();

const buttonPushed = document.querySelector('#searchButton');

function initialize() {
    var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
    viewer.load('ISBN:0738531367');
}

google.books.setOnLoadCallback(initialize);

buttonPushed.addEventListener('click', function(e) {
    // get the search term
    const searchTerm = document.querySelector('#searchText').value;
    console.log("I got pushed");
    console.log(searchTerm);
    document.getElementById('searchText').value = '';
    runSearch(searchTerm);
});


function runSearch(searchTerm) {
    console.log("yeah bruh the term I got was " + searchTerm);
    
}

