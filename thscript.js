function createEverything() {
  let songs = JSON.parse(sessionStorage.getItem('songs'))
  sessionStorage.setItem("count",songs.length+1)
  if(songs.length == 0) {
    let noSongs = document.createElement("div")
    noSongs.classList.add("songs");
    noSongs.style.textAlign = 'center';
    noSongs.innerText = "You currently have no saved song lessons. Once created, song lessons will appear here."
    document.querySelector("#songsholder").appendChild(noSongs);
  } else {
    songs.forEach((song) => {
      
      // Create a new div.
    var newSongDiv = document.createElement("div");
    newSongDiv.classList.add("songs");

    // Add the title and code elements to the new div.
    var titleElement = document.createElement("div");
    titleElement.classList.add("title");
    titleElement.innerText = song.title + " by " + song.artist

    var infoDiv = document.createElement("div");
    infoDiv.classList.add("info");

    var codeElement = document.createElement("span");
    codeElement.classList.add("code");
    codeElement.innerText = "Play Code: " + song.playcode

    var viewElement = document.createElement("span");
    viewElement.id = song.id
    viewElement.classList.add("view");
    viewElement.innerText = "View";
    viewElement.onclick = function() { 
      window.postMessage("view" + viewElement.id, "*");
    };


    var editElement = document.createElement("span");
    editElement.id = song.id
    editElement.classList.add("edit");
    editElement.innerText = "Edit";
    editElement.onclick = function() { 
      window.postMessage("edit" + editElement.id, "*");
    };


    infoDiv.appendChild(codeElement)
    infoDiv.appendChild(viewElement)
    infoDiv.appendChild(editElement)

    newSongDiv.appendChild(titleElement);
    newSongDiv.appendChild(infoDiv);

    // Append the new div to the songs holder div.
    document.querySelector("#songsholder").append(newSongDiv)
  });
  }

  const newb = document.querySelector("#new")
  newb.addEventListener('click', (e) => {
    e.preventDefault()
    window.location.href = 'input.html'
})
}





//store the id in the div so that on click we can get that one