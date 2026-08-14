import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import {getFirestore, collection, query, where, onSnapshot, getDoc, doc, updateDoc} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "",
  authDomain: "the-language-of-music.firebaseapp.com",
  projectId: "the-language-of-music",
  storageBucket: "the-language-of-music.appspot.com",
  messagingSenderId: "794027964297",
  appId: "1:794027964297:web:eb8af18cd168b4a9fa9358",
  measurementId: "G-SXYWZL8WD5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore()
const colRef = collection(db, 'lyrics')

window.addEventListener("message", (event) => {
  const value = event.data
  if(value.substring(0, 3) == "get") {
    let type = value.substring(3)
    let ref = sessionStorage.getItem("currID")
    const docRef = doc(colRef, ref)
    getDoc(docRef)
      .then(snapshot => {
        let currentsong = JSON.stringify(snapshot.data())
        sessionStorage.setItem("currsong", currentsong)
      }).then(
        (message) => {
          if(type == "lyrics") {
            window.location.href = "editlyrics.html"
          } else if (type == "blanks") {
            window.location.href = "editblanks.html"
          } else if (type == "video") {
            window.location.href = "editvideo.html"
          } else if (type == "settings") {
            window.location.href = "editsettings.html"
          }
        }
      )
  }
  if(value == "updatelyrics"){
    const docRef = doc(colRef, sessionStorage.getItem("currID"))
    updateDoc(docRef, {
      lyrics: JSON.parse(sessionStorage.getItem('setLyrics'))
    }).then(
      (message) => {
        window.postMessage("getblanks", "*");
      }
    )
  }
  if(value == "updatevid") {
    const docRef = doc(colRef, sessionStorage.getItem("currID"))
    updateDoc(docRef, {
      video: sessionStorage.getItem("vidid")
    }).then(
      (message) => {
        window.location.href = "editchoose.html"
      }
    )
  }
  if(value == "updatesettings") {
    const docRef = doc(colRef, sessionStorage.getItem("currID"))
    updateDoc(docRef, {
      setttings: JSON.parse(sessionStorage.getItem('settings'))
    }).then(
      (message) => {
        window.location.href = "editchoose.html"
      }
    )
  }
  if(value == "updateblanks") {
    const docRef = doc(colRef, sessionStorage.getItem("currID"))
    updateDoc(docRef, {
      blanks: JSON.parse(sessionStorage.getItem('setBlanks'))
    }).then(
      (message) => {
        window.location.href = "editchoose.html"
      }
    )
  }
  if(value.slice(0, 4) == "view") {
    let value2 = value.slice(4);
    const docRef = doc(colRef, value2)
    getDoc(docRef)
      .then(snapshot => {
        let currentsong = JSON.stringify(snapshot.data())
        sessionStorage.setItem("currsong", currentsong)
        window.location.href = "view.html"
      })
  } else if (value.slice(0, 4) == "edit") {
    let value2 = value.slice(4);
    sessionStorage.setItem("currID", value2)
    window.location.href = "editchoose.html"
  }
})
