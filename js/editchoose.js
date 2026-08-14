function options(type) {
  window.postMessage("get" + type, "*");
}



function show2(){
  const button = document.querySelector('#get')
  
  let link = null
  button.addEventListener('click', (e) => {
    link = document.querySelector('.box').value.trim()
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
      document.getElementById('player').src = link
    }
  })

  const butt2 = document.querySelector(".next")
    butt2.addEventListener('click', (e) => {
    e.preventDefault()
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
      sessionStorage.setItem("vidid", link)
      window.postMessage("updatevid", "*");
    }
  })
}

async function show3() {
  const checkboxes1 = document.querySelectorAll("input[type='checkbox']")
  let song = JSON.parse(sessionStorage.getItem('currsong'))
  let setts = song.setttings
  let i = 0
  for (const checkbox of checkboxes1){
    checkbox.checked = setts[i].checked
    i++
  }

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
    window.postMessage("updatesettings", "*");
  })
}

function show() {
  displayLyrics(JSON.parse(sessionStorage.getItem('currsong')).lyrics)
    const butt1 = document.querySelector(".next")
    butt1.addEventListener('click', (e) => {
    e.preventDefault()
    let selectedPositions2 = JSON.stringify(selectedPositions);
    sessionStorage.setItem("setBlanks", selectedPositions2)
    window.postMessage("updateblanks", "*");
  })
}

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
  setBlanks(lyricsContainer)
  addEventListenersToLyrics();
}

function addEventListenersToLyrics() {
  const lyricsContainer = document.getElementById('lyrics');
  lyricsContainer.addEventListener('click', selectBlank);
}

function setBlanks(lyricsContainer) {
  let song = JSON.parse(sessionStorage.getItem('currsong'))
  let blanks = song.blanks
  for(const element of blanks) {
    const parts = element.split(' ');
    const line = parts[0].substring(4).trim()
    const word = parts[1].substring(5).trim()
      const selector = `span[data-line="${line}"][data-word="${word}"]`;
      const yay = lyricsContainer.querySelector(selector);
      if (yay) {
        yay.classList.add('blank');
        selectedPositions.push("form" + line + " blank" + word);
      }
  }
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

async function start() {
  let song = JSON.parse(sessionStorage.getItem('currsong'))
  let better = song.lyrics
  genForm(better)
  const butt = document.querySelector(".next")
  butt.addEventListener('click', (e) => {
    e.preventDefault()
    let form = document.querySelector("#teacherLyrics")
    processForm(form)
    let cleanlyrics2 = JSON.stringify(cleanlyrics);
    sessionStorage.setItem("setLyrics", cleanlyrics2)
    window.postMessage("updatelyrics", "*");
  })
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