import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import {getFirestore, collection, query, where,onSnapshot, getDocs, doc} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js"
import{ getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js"


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
const auth = getAuth()
const db = getFirestore()
const colRef = collection(db, 'lyrics')


const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
signupBtn.onclick = (()=>{
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
});
loginBtn.onclick = (()=>{
  loginForm.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
});
signupLink.onclick = (()=>{
  signupBtn.click();
  return false;
});


const signupForm = document.querySelector('form.signup')
signupForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const email = signupForm.email.value
  const password = signupForm.password.value
  const cpassword = signupForm.cpassword.value
  if(password != cpassword){
    alert("Please make sure passwords match.")
  } else {
    createUserWithEmailAndPassword(auth, email, password)
    .then(cred => {
      check(auth.currentUser)
    })
    .catch(err => {
      if(err.code == "auth/email-already-in-use") {
        alert("An account with this email already exists. Trying logging in instead of signing up.")
      } else if (err.code == "auth/weak-password"){
        alert("Please make sure your password has at least 6 characters.")
      }
      else {
        alert(err.message)
      }
    })
  }
  return false
})

loginForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const email = loginForm.email.value
  const password = loginForm.password.value
  signInWithEmailAndPassword(auth, email, password)
  .then(cred => {
    check(auth.currentUser)
  })
  .catch(err => {
    if(err.code == "auth/user-not-found") {
      alert("An account with this email does not exist. Try signing up instead of logging in.")
    } else if (err.code == "auth/weak-password"){
      alert("Please make sure your password has at least 6 characters.")
    }
    else {
      alert(err.message)
    }
  })
  return false
})

async function check(user) {
  if(user) {
    const uid = user.uid;
    sessionStorage.setItem("uid", uid)
    const q = query(colRef, where("theid", "==", uid))
    const querySnapshot = await getDocs(q)
    let songs = []
    querySnapshot.forEach((doc) => {
      songs.push({ ...doc.data(), id: doc.id })
    });
    songs = JSON.stringify(songs);
    sessionStorage.setItem("songs", songs)
    window.location.href = 'teachhome.html'
  }
}



