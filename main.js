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

function createForm(lyrics) {
  const header = document.querySelector(".headsong")
  header.innerHTML = `<p id="songheader"> "${sessionStorage.getItem("title")}" by ${sessionStorage.getItem("artist")}</p>`
  let idF = "line"
  let formC = 1
  const div = document.querySelector(".content")
  const linebreak = document.createElement("br");
  for (const line of lyrics) {
    if (line == null) {
      if (formC > 1) {
        const d = document.createElement('div')
        d.className = "lb"
        div.append(d)
      }
      formC -= 1
    } else {
      const words = line.split(" ")
      const form = document.createElement("form")
      form.id = idF + formC
      div.append(form)
      for (let word of words) {
        let regExp = /\p{P}/u;
        if (regExp.test(word.slice(-1)) || regExp.test(word.charAt(0))) {
          let pu1 = word.charAt(0)
          if (regExp.test(word.charAt(0))) {
            console.log(pu1)
            if (!(word == pu1)) {
              word = word.replace(pu1, '')
              punct(form, pu1)
            }
          }
          if (word == pu1 && regExp.test(pu1)) {
            punct(form, pu1)
          } else {
            let pu2 = word.slice(-1)
            if (regExp.test(pu2)) {
              word = word.replace(pu2, '')
              createBlanks(form, word)
              punct(form, pu2)
            } else {
              createBlanks(form, word)
            }
          }
        } else {
          createBlanks(form, word)
        }
      }
      createButtons(form, formC)
    }
    formC += 1
  }
}

function punct(form, pu) {
  let p = document.createElement('p')
  let com = document.createTextNode(pu)
  p.append(com)
  p.style.display = "inline"
  p.style.position = "relative"
  p.style.top = "5px"
  form.append(p)
}

function createBlanks(form, word) {
  const box = document.createElement("input");
  box.type = "text"
  box.className = "blanks"
  box.placeholder = word.length
  box.answer = word
  box.autocomplete = "off"
  let w = word.length * 10 + 20
  box.style.width = w + "px"
  form.append(box)
}

function createButtons(form, formC) {
  let icon = `<i onclick="playpause(this)" class="fa-solid fa-play" id="${formC}"></i>`
  form.insertAdjacentHTML("beforeend", icon)
}

function playpause(x) {
  x.classList.toggle("fa-pause");
  x.classList.toggle("fa-play");
  let form = document.getElementById(`line${x.id}`)
  if (x.className.includes("fa-pause")) {
    check(form)
  } else {
    allowEdit(form)
  }
  checkAll()
}

function check(form) {
  let reqAcc = document.getElementById('reqAcc').checked
  let rev = document.getElementById('*rev').checked
  const removeAccents = str =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let inputs = Array.apply(null, form.querySelectorAll('input'))
  for (const inp of inputs) {
    inp.readOnly = "readonly"
    if (rev && inp.value.toLowerCase().trim() == "***") {
      inp.value = inp.answer;
    }
    if (inp.value.toLowerCase().trim() == inp.answer.toLowerCase().trim()) {
      inp.style.borderBottom = "2px solid #418b5a"
      inp.style.color = "#418b5a"
      inp.value = inp.answer
    } else if (removeAccents(inp.answer.toLowerCase().trim()) == removeAccents(inp.value.toLowerCase()).trim()) {
      if (reqAcc) {
        inp.style.borderBottom = "2px solid #0F6292"
        inp.style.color = "#0F6292"
      } else {
        inp.style.borderBottom = "2px solid #418b5a"
        inp.style.color = "#418b5a"
        inp.value = inp.answer
      }
    } else {
      inp.style.borderBottom = "2px solid #C85C5C"
      inp.style.color = "#C85C5C"
    }
  }
}

function allowEdit(form) {
  let inputs = Array.apply(null, form.querySelectorAll('input'))
  for (const inp of inputs) {
    inp.removeAttribute("readOnly")
    inp.style.color = "black"
  }
}

function start() {
  let form = document.getElementById('inpform')
  let inputs = Array.apply(null, form.querySelectorAll('input'))
  const title = inputs[0].value.trim()
  const artist = inputs[1].value.trim()
  if (title == "" || artist == "") {
    alert('Please fill out all fields before submitting!')
    return false;
  } else {
    sessionStorage.setItem("title", title)
    sessionStorage.setItem("artist", artist)
    window.location.href = "play.html"
  }
}

function start2(){
  window.postMessage("codesend", "*");
}

async function createEverything() {
  let title = sessionStorage.getItem("title")
  let artist = sessionStorage.getItem("artist")
  if (title == "La Famille" && artist == "Tony Parker") {
    vidId = "AAkX9yQ4eHI"
    const lafamille = ["[Tony Parker : La famille]", "Comment résumer ma vie", "Sans parler de ma famille", "Maman je t'aime", "Papa je t'aime à la folie", "Mes deux petits frères aussi", "Vous disent merci", "Merci pour l'éducation", "L'école de la vie", "[]", "Comment résumer ma vie", "J'ai ving-trois piges", "Enfance difficile mais magnifique", "J'ai grandi avec le minimum", "L'amour de mes parents", "Le meilleur de deux mondes", "Un père noir", "Une mère blanche", "Métissage entre l'Europe et les USA", "V'la le mélange", "Le cocktail explosif", "Papa joue au basket", "Maman fait du mannequinat", "À la maison le daron est strict", "Je reçois des coups de pieds de 46", "Quand je fais des bêtises", "Avec mes frères s'est dur", "Mais c'est grâce à ça", "Qu'aujourd'hui je suis un homme qui s'affirme", "[Refrain]", "I just wanna thank you", "Say thank you", "For everything you've done for me", "I just wanna thank you", "Say thank you", "For all the love you've given to me", "[Verse 2]", "Comment résumer ma vie", "Sans parler de ma famille", "Maman merci pour les vitamines", "J'aurai jamais assez de mots, assez de rimes, assez de salive", "Pour expliquer ton rôle dans la réussite de ma vie", "Papa merci pour le Sket-Ba", "L'amour du jeu, le mental, la pression", "C'est à travers mes yeux que tu réalises ton rêve", "La fierté de mon père", "Le jour de la draft mais", "Les années passent, défilent", "C'est comme un film", "Même tout l'argent que j'ai ne vaut pas ma famille", "Même tout l'argent du monde ne vaut pas la famille", "Je te le répète", "Bien avant le matériel et le succès", "Bien avant le basket et les paillettes", "Vous êtes la raison pour laquelle j'ai les pieds sur terre", "Même millionnaire je garderai mes repères", "[Refrain]", "I just wanna thank you, I wanna thank you", "Say thank you", "For everything you've done for me", "I just wanna thank you, I wanna thank you", "Say thank you", "For all the love you've given to me", "And all that I can say is, thank you, thank you, thank you, thank you, thank you, thank you", "And all that I can say, thank you, thank you, thank you, thank you, thank you, thank you", "[]", "All I wanna say, is thank you", "All I can say is", "I say, all I can say is", "[]", "C'est pour toute les reums et darons", "Où que ce soit de Bamako au fin fond du Texas", "C'est pour toute les reums et darons", "Où que ce soit de Bamako au fin fond du Texas", "C'est pour toute les reums et darons", "Où que ce soit de Bamako au fin fond du Texas", "C'est pour toute les reums et darons", "Où que ce soit de Bamako au fin fond du Texas", "[]", "All I wanna say is thank you from the bottom of my heart"]
    const better = await cleanUpLyrics(lafamille)
    createForm(better)
    embed()
  } else if (title == "Papaoutai" && artist == "Stromae") {
    vidId = "qDBqiRdvvoo"
    const papaoutai = ["[Paroles de ‘Papaoutai’]", "[Couplet 1]", "Dites-moi d'où il vient", "Enfin je saurai où je vais", "Maman dit que lorsqu'on cherche bien", "On finit toujours par trouver", "Elle dit qu'il n'est jamais très loin", "Qu'il part très souvent travailler", "Maman dit travailler c'est bien", "Bien mieux qu'être mal accompagné", "Pas vrai ?", "[Pont]", "Où est ton papa ?", "Dis-moi où est ton papa ?", "Sans même devoir lui parler", "Il sait ce qui ne va pas", "Ah sacré papa", "Dis-moi où es-tu caché ?", "Ça doit, faire au moins mille fois que j'ai", "Compté mes doigts", "Hey !", "[Refrain]", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es", "Où t'es", "[Couplet 2]", "Quoi, qu'on y croit ou pas", "Y aura bien un jour où on n'y croira plus", "Un jour ou l'autre on sera tous papa", "Et d'un jour à l'autre on aura disparu", "Serons-nous détestables ?", "Serons-nous admirables ?", "Des géniteurs ou des génies ?", "Dites-nous qui donne naissance aux irresponsables ?", "Ah dites-nous qui, tiens", "Tout le monde sait comment on fait des bébés", "Mais personne sait comment on fait des papas", "Monsieur Je-sais-tout en aurait hérité, c'est ça", "Faut l'sucer d'son pouce ou quoi ?", "Dites-nous où c'est caché, ça doit", "Faire au moins mille fois qu'on a", "Bouffé nos doigts", "Hey !", "[Refrain]", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es", "Où t'es", "[Pont]", "Où est ton papa ?", "Dis-moi où est ton papa ?", "Sans même devoir lui parler", "Il sait ce qui ne va pas", "Ah sacré papa", "Dis-moi où es-tu caché ?", "Ça doit, faire au moins mille fois que j'ai", "Compté mes doigts", "Hey", "Où est ton papa ?", "Dis-moi où est ton papa ?", "Sans même devoir lui parler", "Il sait ce qui ne va pas", "Ah sacré papa", "Dis-moi où es-tu caché ?", "Ça doit, faire au moins mille fois que j'ai", "Compté mes doigts", "Hey !", "[Refrain]", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es", "Où t'es"]
    const better = await cleanUpLyrics(papaoutai)
    createForm(better)
    embed()
  } else {
    const lyrics = await getSong(title, artist)
    const better = await cleanUpLyrics(lyrics)
    createForm(better)
    getVid(title, artist)
  }
}

function preset(code) {
  if (code == "lafamille") {
    sessionStorage.setItem("title", "La Famille")
    sessionStorage.setItem("artist", "Tony Parker")
    window.location.href = "play.html"
  } else if (code == "papaoutai") {
    sessionStorage.setItem("title", "Papaoutai")
    sessionStorage.setItem("artist", "Stromae")
    window.location.href = "play.html"
  }
}

function charCt(check) {
  let blanks = document.querySelectorAll(".blanks")
  if (check.checked) {
    for (const b of blanks) {
      b.placeholder = b.answer.length
    }
  } else {
    for (const b of blanks) {
      b.placeholder = ""
    }
  }
}

function firWd(check) {
  let forms = document.querySelectorAll("form")
  for (const f of forms) {
    let blanks = f.querySelectorAll('input')
    if (check.checked) {
      blanks[0].value = blanks[0].answer
    } else {
      if (blanks[0].style.borderBottom == '') {
        blanks[0].value = ''
      }
    }
  }
}

function lasWd(check) {
  let forms = document.querySelectorAll("form")
  for (const f of forms) {
    let blanks = f.querySelectorAll('input')
    let last = blanks[blanks.length - 1]
    if (check.checked) {
      last.value = last.answer
    } else {
      if (last.style.borderBottom == '') {
        last.value = ''
      }
    }
  }
}

const optionsYT = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '',
    'X-RapidAPI-Host': 'youtube138.p.rapidapi.com'
  }
};

let vidId = null
const getVidId = async (title, artist) => {
  const removeAccents = str =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let del = /\s/g;
  let searchTitle = removeAccents(title.replace(del, "%20"));
  let searchArtist = removeAccents(artist.replace(del, "%20"));
  console.log(searchTitle + ' ' + searchArtist)
  try {
    const fet = await fetch(`https://youtube138.p.rapidapi.com/search/?q=${searchTitle}%20${searchArtist}%20audio&gl=US`, optionsYT)
    const search = await fet.json()
    vidId = search.contents[0].video.videoId
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
    videoId: vidId,
    playerVars: {
      'playsinline': 1,
      'modestbranding': 1,
    }
  })
}

const getVid = async (title, artist) => {
  await getVidId(title, artist);
  embed()
}

function minimize(text) {
  let pholder = document.getElementById("playerholder")
  let vstuff = document.querySelector(".vidstuff")
  // let ttext = document.querySelector(".tooltiptext")
  let icons = document.querySelector(".icons")
  let min = document.querySelector(".min")
  if (text.innerHTML.includes("Maximize")) {
    pholder.style.height = "242px"
    pholder.style.width = "430px"
    vstuff.style.marginLeft = "70px"
    // ttext.style.marginLeft = "33.5px"
    icons.style.marginBottom = "15px"
    min.style.marginTop = "15px"
    text.innerHTML = "<u>Click to Minimize</u>"
  } else {
    pholder.style.height = "60.5px"
    pholder.style.width = "107.5px"
    vstuff.style.marginLeft = "170px"
    // ttext.style.marginLeft = "84px"
    icons.style.marginBottom = "10px"
    min.style.marginTop = "10px"
    text.innerHTML = "<u>Click to Maximize</u>"
  }
}

function openSettings() {
  let sett = document.querySelector(".settings")
  sett.style.visibility = "visible"
  sett.style.transform = "scale(1)"
}

function closeSettings() {
  let sett = document.querySelector(".settings")
  sett.style.visibility = "hidden"
  sett.style.transform = "scale(0.0005)"
}

let alreadyfinished = false;
function checkAll() {
  let allChecked = true
  let forms = document.querySelectorAll("form")
  for (const f of forms) {
    let blanks = f.querySelectorAll('input')
    for(const b of blanks) {
      if(b.value == "") {
        allChecked = false
      }
      if(b.style.color == "#C85C5C") {
        allChecked = false
      }
    }
  }
  if (allChecked && alreadyfinished == false) {
    alreadyfinished = true
    // let yay = document.querySelector(".youdidit")
    // yay.style.visibility = "visible"
    // yay.style.transform = "scale(1) translateY(25%)"
    // setTimeout(function() {
    //   yay.style.transition = "0.3s"
    //   yay.style.transform = "scale(0.005)"
    //   yay.style.visibility = "hidden"
    // }, 5000);
    startCon();
    stopCon();
  }
}

const startCon = () => {
  setTimeout(function() {
      confetti.start()
  }, 400); // 1000 is time that after 1 second start the confetti ( 1000 = 1 sec)
};

//  for stopping the confetti 

const stopCon = () => {
  setTimeout(function() {
      confetti.stop()
  }, 4000); // 5000 is time that after 5 second stop the confetti ( 5000 = 5 sec)
};
// after this here we are calling both the function so it works