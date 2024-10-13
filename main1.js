function createForm(song, lyrics) {
  const header = document.querySelector(".headsong")
  header.innerHTML = `<p id="songheader"> "${song.title}" by ${song.artist}</p>`
  const div = document.querySelector(".content")
  const linebreak = document.createElement("br");
  const idF = "form"
  let formC = 0
  for (const line of lyrics) {
    if (line == null) {
      if (formC > 0) {
        const d = document.createElement('div')
        d.className = "lb"
        div.append(d)
      }
      formC -= 1
    } else {
      let blankC = 0
      const words = line.split(" ")
      const form = document.createElement("form")
      form.id = idF + formC
      div.append(form)
      for (let word of words) {
        let regExp = /\p{P}/u;
        if (regExp.test(word.slice(-1)) || regExp.test(word.charAt(0))) {
          let pu1 = word.charAt(0)
          if (regExp.test(word.charAt(0))) {
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
              createBlanks(form, word, blankC, song)
              blankC+=1
              punct(form, pu2)
            } else {
              createBlanks(form, word, blankC, song)
              blankC+=1
            }
          }
        } else {
          createBlanks(form, word, blankC, song)
          blankC+=1
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

function createBlanks(form, word, blankC, song) {
  let blanks = song.blanks
  const box = document.createElement("input");
  box.id = "blank" + blankC
  const current = form.id + " " + box.id
  box.type = "text"
  box.className = "blanks"
  box.placeholder = word.length
  box.answer = word
  box.autocomplete = "off"
  if (!blanks.includes(current)) {
    box.value = box.answer
  }
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
  let form = document.getElementById("form" + x.id)
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


function createEverything() {
  let song = JSON.parse(sessionStorage.getItem('currsong'))
  createForm(song, song.lyrics)
  let setts = song.setttings
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  let i = 0
  for (const checkbox of checkboxes){
    checkbox.checked = setts[i].checked
    if(i==0) {
      charCt(checkbox)
    }
    checkbox.disabled = true
    i++
  }
  document.getElementById('player').src = song.video
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
    start();
    stop();
  }
}

const start = () => {
  setTimeout(function() {
      confetti.start()
  }, 400); // 1000 is time that after 1 second start the confetti ( 1000 = 1 sec)
};

//  for stopping the confetti 

const stop = () => {
  setTimeout(function() {
      confetti.stop()
  }, 4000); // 5000 is time that after 5 second stop the confetti ( 5000 = 5 sec)
};
// after this here we are calling both the function so it works


// function minimize(text){
//   let pholder = document.getElementById("player")
//   let vstuff = document.querySelector(".vidstuff")
//   let ttext = document.querySelector(".tooltiptext")
//   let icons = document.querySelector(".icons")
//   let min = document.querySelector(".min")
//   if(text.innerHTML.includes("Maximize")) {
//     pholder.style.height = "242px"
//     pholder.style.width = "430px"
//     vstuff.style.marginLeft = "70px"
//     ttext.style.marginLeft = "33.5px"
//     icons.style.marginBottom = "15px"
//     min.style.marginTop = "15px"
//     text.innerHTML = "<u>Click to Minimize</u>"
//   } else {
//     pholder.style.height = "60.5px"
//     pholder.style.width = "107.5px"
//     vstuff.style.marginLeft = "170px"
//     ttext.style.marginLeft = "84px"
//     icons.style.marginBottom = "10px"
//     min.style.marginTop = "10px"
//     text.innerHTML = "<u>Click to Maximize</u>"
//  }
// }

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