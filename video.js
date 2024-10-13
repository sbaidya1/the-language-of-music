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
    videoId: vidId,//vidId,
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

const button = document.querySelector('#get')
button.addEventListener('click', (e) => {
  const link = document.querySelector('.box').value
  const parts = link.split('?');
  const videoID = parts[1].split('v=')[1];
  vidId = videoID.substring(0, 11);
  embed()
})