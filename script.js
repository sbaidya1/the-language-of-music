function start1() {
  let form = document.getElementById('inpform')
  let inputs = Array.apply(null, form.querySelectorAll('input'))
  const title = inputs[0].value.trim()
  const artist = inputs[1].value.trim()
  if (title == "" || artist == "") {
    alert('Please fill out all fields before submitting.')
    return false;
  } else {
    sessionStorage.setItem("title", title)
    sessionStorage.setItem("artist", artist)
    window.location.href = "edit.html"
  }
}


const optionsGenius = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '',
		'X-RapidAPI-Host': 'genius-song-lyrics1.p.rapidapi.com'
	}
};

const getId = async (title, artist) => {
  let del = /\s/g;
  let searchTitle = title.replace(del, "%20");
  let searchArtist = artist.replace(del, "%20");
  let id = 0;
  try {
    const fet = await fetch(`https://genius-song-lyrics1.p.rapidapi.com/search/?q=${searchTitle}%20${searchArtist}&per_page=10&page=1`, optionsGenius);
    const search = await fet.json();
    id = search.hits[0].result.id
  } catch (error) {
    console.log("song not found")
    console.log(error)
  }
  return id;
}

const getLyrics = async (id) => {
  let lyrics = [];
  try {
    const fet = await fetch(`https://genius-song-lyrics1.p.rapidapi.com/song/lyrics/?id=${id}&text_format=dom`, optionsGenius)
    const response = await fet.json();
    lyrics = response.lyrics.lyrics.body.dom.children[0].children;

    for (let i = 0; i < lyrics.length; i++) {
      element = lyrics[i]
      if (typeof element === 'object' && element !== null && 'children' in element) {
        while ('children' in element) {
          element = element.children
        }
        let index = i
        lyrics.splice(index, 1)
        for (const line of element) {
          lyrics.splice(index, 0, line)
          index++
        }
      }
    }
    lyrics = lyrics.filter((line) => {
      return (typeof line === 'string' || line instanceof String)
    })
    lyrics = lyrics.filter((line) => {
      return !(line === "")
    })
  } catch (error) {
    console.log("lyrics not found")
    console.log(error)
  }
  return lyrics;
}

const getSong = async (title, artist) => {
  const id = await getId(title, artist);
  const lyrics = await getLyrics(id);
  return lyrics
}


async function cleanUpLyrics(lyrics) {
  for (let i = 0; i < lyrics.length; i++) {
    lyrics[i] = lyrics[i].replace(/ *\([^)]*\) */g, " ").trim()
    if (lyrics[i].slice(0, 1) == "[" || lyrics[i] == "") {
      lyrics[i] = null
    }
    if(lyrics[i] != null && lyrics[i].length == 1 && /[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g.test(lyrics[i])) {
      lyrics[i] = null
    }

    if(lyrics[i] != null && lyrics[i].match(/\./g)) {
      if(lyrics[i].match(/\./g).length > 1) {
        lyrics[i] = lyrics[i].replace(/\./g, '')
      }
    }
  }
  return lyrics
}

let cleanlyrics
async function genForm(lyrics) {
  cleanlyrics = lyrics
  const form = document.querySelector("#teacherLyrics")
  let count = 0
  for (const line of cleanlyrics) {
    if (line == null) {
      if (count > 1) {
        const d = document.createElement('div')
        d.className = "lb"
        form.append(d)
        count--
      }
    } else {
      const box = document.createElement("textarea")
      box.type = "text"
      box.className = "blanks"
      box.value = line
      box.autocomplete = "off"
      form.append(box)
      box.style.width = box.value.length + 'ch';
      const rows = box.value.split('\n').length;
      box.style.height = rows * 1.5 + 'em';
      box.oninput = function() {
        adjustInputSize(this);
      };
      box.onkeydown = function(event) {
        adjustInputSizeOnEdit(event);
      };
    }
    count++
  }
  // Step 2: Create a new submit button element
  // const submitButton = document.createElement('button');

  // // Step 3: Set attributes and styles for the submit button
  // submitButton.type = 'submit';
  // submitButton.textContent = 'Save Changes';
  // submitButton.id = 'subm';
  // submitButton.classList.add('submit-button'); // Adding a class for styling

  // // Step 4: Append the submit button to the form
  // form.appendChild(submitButton);

  // form.addEventListener('submit', (e) => {
  //   e.preventDefault()
  //   let dateTimeDiv
  //   if(document.querySelector('.time') !== null) {
  //     dateTimeDiv = document.querySelector('.time')
  //     const now = new Date();
  //     const currentDateTime = now.toLocaleString();
  //     dateTimeDiv.innerText = "Edits saved at: " + currentDateTime
  //     form.append(dateTimeDiv)
  //   } else {
  //     dateTimeDiv = document.createElement("div");
  //     dateTimeDiv.className = "time"
  //     const now = new Date();
  //     const currentDateTime = now.toLocaleString();
  //     dateTimeDiv.innerText = "Edits saved at: " + currentDateTime
  //     form.append(dateTimeDiv)
  //   }
  //   processForm(form)
  // })
}

async function processForm(form) {
  const textareas = form.querySelectorAll("textarea");
  let index = 0
  textareas.forEach(textarea => {
    const line = textarea.value.trim()//.split('\n');
    if (line == '') {
      index--;
    } else {
      while (cleanlyrics[index] == null) {
        index++;
      }
      cleanlyrics[index] = line
    }
    index++
  });
  for (let i = 0; i < cleanlyrics.length; i++) {
    if (cleanlyrics[i] != null && cleanlyrics[i].indexOf("\n") !== -1) {
      let phrase = cleanlyrics[i].split('\n')
      phrase.reverse()
      cleanlyrics.splice(i, 1)
      phrase.forEach(line => {
        cleanlyrics.splice(i, 0, line)
      })
    }
  }
}

let wid = 0
function adjustInputSize(input) {
  const rows = input.value.split('\n').length;
  input.style.height = rows * 1.5 + 'em';
  if (rows > 1) {
    wid = (input.value.length) / rows + 10
  } else {
    wid = input.value.length
  }
  input.style.width = wid + 'ch'
}

function adjustInputSizeOnEdit(event) {
  const input = event.target;
  setTimeout(() => {
    input.style.width = wid + 'ch'
  }, 0);
}

//select blank functions (step 2)
let selectedPositions = [];

function displayLyrics(lyricsArray) {
  const lyricsContainer = document.getElementById('lyrics');
  let nullC = 0
  let lineC = 0
  for (let lineIndex = 0; lineIndex < lyricsArray.length; lineIndex++) {
    const line = lyricsArray[lineIndex];
    if (line == null) {
      if(nullC > 0) {
        const d = document.createElement('div')
        d.className = "lb"
        lyricsContainer.append(d)
      }
      nullC--
      lineC--
    } else {
      const words = line.split(' ');
      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        const word = words[wordIndex];
        // Wrap each word in a <span> element with data attributes for line and word index
        lyricsContainer.innerHTML += `<span data-line="${lineC}" data-word="${wordIndex}">${word}</span> `;
      }
      lyricsContainer.innerHTML += '<br>';
      }
    nullC++
    lineC++;
  }  
  addEventListenersToLyrics();
}

function addEventListenersToLyrics() {
  const lyricsContainer = document.getElementById('lyrics');
  lyricsContainer.addEventListener('click', selectBlank);
}


function selectBlank(event) {
  if (!event.target.matches('span')) {
    return;
  }
  const selectedWord = event.target;
  const lineIndex = parseInt(selectedWord.dataset.line);
  const wordIndex = parseInt(selectedWord.dataset.word);

  const positionString = "form" + lineIndex + " blank" + wordIndex

  if (!selectedPositions.includes(positionString)) {
    selectedPositions.push(positionString);
    selectedWord.classList.add('blank'); // Add a class to change the color of the selected word
  } else {
    selectedPositions = selectedPositions.filter((pos) => pos !== positionString);
    selectedWord.classList.remove('blank'); // Remove the class to deselect the word
  }
}

//get vid functions (step 3)
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

const getVid = async (title, artist) => {
  await getVidId(title, artist);
  embed()
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
    videoId: vidId,
    playerVars: {
      'playsinline': 1,
      'modestbranding': 1,
    }
  })
}

//onload functions
async function start() {
  const lyrics = await getSong(sessionStorage.getItem("title"), sessionStorage.getItem("artist"))
  console.log(lyrics)
  const better = await cleanUpLyrics(lyrics)
  genForm(better)
  const butt = document.querySelector(".next")
  butt.addEventListener('click', (e) => {
    e.preventDefault()
    let form = document.querySelector("#teacherLyrics")
    processForm(form)
    let cleanlyrics2 = JSON.stringify(cleanlyrics);
    sessionStorage.setItem("setLyrics", cleanlyrics2)
    window.location.href = 'choose.html'
  })
}

function show() {
  displayLyrics(JSON.parse(sessionStorage.getItem('setLyrics')))
    const butt1 = document.querySelector(".next")
    butt1.addEventListener('click', (e) => {
    e.preventDefault()
    let selectedPositions2 = JSON.stringify(selectedPositions);
    sessionStorage.setItem("setBlanks", selectedPositions2)
    window.location.href = 'video.html'
  })
  // const butt2 = document.querySelector(".prev")
  // butt2.addEventListener('click', (e) => {
  //   e.preventDefault()
  //   window.location.href = 'index.html'
  // })
}

function show2(){
  const button = document.querySelector('#get')
  
  let link = null
  button.addEventListener('click', (e) => {
    link = document.querySelector('.box').value.trim()
    if(link != null) {
      link = link.replace(/^["']/, '');
      // Remove quotations from the end of the string
      link = link.replace(/["']$/, ''); 
    }
    if(link == null) {
      alert("Please enter an embed link.")
    } else if (!link.includes("youtube") && !link.includes("drive.google")){
      alert("This is not the right type of link. Only embed links for Google Drive and YouTube are compatible.")
    } else if (!link.includes("embed") && link.includes("youtube")){
      alert('This is not an embed link. Please insert an embed link.')
    } else {
      document.getElementById('player').src = link
    }
  })

  const butt2 = document.querySelector(".next")
    butt2.addEventListener('click', (e) => {
    e.preventDefault()
    if(!link == null) {
      link = link.replace(/^["']/, '');
      // Remove quotations from the end of the string
      link = link.replace(/["']$/, '');   
    }
    if(link == null) {
      alert("Please enter an embed link.")
    } else if (!link.includes("youtube") && !link.includes("drive.google")){
      alert("This is not the right type of link. Only embed links for Google Drive and YouTube are compatible.")
    } else if (!link.includes("embed") && link.includes("youtube")){
      alert('This is not an embed link. Please insert an embed link.')
    } else {
      sessionStorage.setItem("vidid", link)
      window.location.href = 'settings.html'
    }
  })
}

async function show3() {
  const finish = document.querySelector('.finish')
  finish.addEventListener('click', (e) => {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const checkboxObjects = [];
    for (const checkbox of checkboxes) {
      checkboxObjects.push({
        id: checkbox.id,
        checked: checkbox.checked
      });
    }
    let checkboxObjects2 = JSON.stringify(checkboxObjects)
    sessionStorage.setItem("settings", checkboxObjects2)
    window.postMessage("save", "*");
  })
}


