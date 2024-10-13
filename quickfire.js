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

async function start2() {
  let form = document.getElementById('codeform')
  let code = form.querySelector('input').value.trim()
  if (code == "") {
    alert("Please enter a play code")
  } else {
    try{
      const q = await query(colRef, where("playcode", "==", code))
      const querySnapshot = await getDocs(q)
      let songs = []
      querySnapshot.forEach((doc) => {
        songs.push({ ...doc.data(), id: doc.id })
      });
      let currentsong = JSON.stringify(songs[0])
      sessionStorage.setItem("currsong", currentsong)
      window.location.href = "view.html"

    } catch(e) {
      alert("This is not a valid play code.")
    }
  } 
}

window.addEventListener("message", (event) => {
  const value = event.data;
  if(value == "codesend") {
    start2()
  }
});

