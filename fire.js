import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import {getFirestore, collection, query, where,onSnapshot, getDocs, doc, addDoc} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js"

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
  const value = event.data;
  if (value == "save") {
    addDoc(colRef, {
      title: sessionStorage.getItem('title'),
      artist: sessionStorage.getItem('artist'),
      lyrics: JSON.parse(sessionStorage.getItem('setLyrics')),
      blanks: JSON.parse(sessionStorage.getItem('setBlanks')),
      video: sessionStorage.getItem('vidid'),
      setttings: JSON.parse(sessionStorage.getItem('settings')),
      theid: sessionStorage.getItem('uid'),
      playcode: sessionStorage.getItem("count") + sessionStorage.getItem('uid').slice(0, 2)
    }).then(
      (message) => {
        getList().then(
          (message) => {
            window.location.href = "teachhome.html"
          }
        )
      }
    )
  }
});

async function getList() {
  const q = query(colRef, where("theid", "==", sessionStorage.getItem('uid')))
  const querySnapshot = await getDocs(q)
  let songs = []
  querySnapshot.forEach((doc) => {
    songs.push({ ...doc.data(), id: doc.id })
  });
  songs = JSON.stringify(songs);
  sessionStorage.setItem("songs", songs)
}