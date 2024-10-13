const optionsYT = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '',
    'X-RapidAPI-Host': 'youtube-search-results.p.rapidapi.com'
  }
};

let vidId = null
const getVidId = async (title, artist) => {
  let del = /\s/g;
  let searchTitle = title.replace(del, "%20");
  let searchArtist = artist.replace(del, "%20");
  try {
    const fet = await fetch(`https://youtube-search-results.p.rapidapi.com/youtube-search/?q=${searchTitle}%20${searchArtist}%20audio`, optionsYT)
    const search = await fet.json()
    vidId = search.items[0].id
  } catch (error) {
    console.log("this is not a valid song")
    console.log(error)
  }
}

function embed() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

var player
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: '0',
    bottom: '0',
    right: '0',
    left: '0',
    videoId: 'Q2Xxmx0oNIQ',//vidId,
    playerVars: {
      'playsinline': 1,
      'modestbranding': 1
    }
  })
}

const getVid = async (title, artist) => {
  await getVidId(title, artist);
  embed()
}
//getVid("Fils de joie", "Stromae")
embed()

 function minimize(text){
    let pholder = document.getElementById("playerholder")
    let vstuff = document.querySelector(".vidstuff")
    let ttext = document.querySelector(".tooltiptext")
    let icons = document.querySelector(".icons")
    let min = document.querySelector(".min")
    if(text.innerHTML.includes("Maximize")) {
      pholder.style.height = "242px"
      pholder.style.width = "430px"
      vstuff.style.marginLeft = "70px"
      ttext.style.marginLeft = "33.5px"
      icons.style.marginBottom = "15px"
      min.style.marginTop = "15px"
      text.innerHTML = "<u>Click to Minimize</u>"
    } else {
      pholder.style.height = "60.5px"
      pholder.style.width = "107.5px"
      vstuff.style.marginLeft = "170px"
      ttext.style.marginLeft = "84px"
      icons.style.marginBottom = "10px"
      min.style.marginTop = "10px"
      text.innerHTML = "<u>Click to Maximize</u>"
   }
}

function openSettings(){
  let sett = document.querySelector(".settings")
  sett.style.visibility = "visible"
  sett.style.transform = "scale(1)"
}

function closeSettings(){
  let sett = document.querySelector(".settings")
  sett.style.visibility = "hidden"
  sett.style.transform = "scale(0.0005)"
}