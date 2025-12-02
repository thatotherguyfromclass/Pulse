// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3No3TbeTgvfDtzGjZcbVicxbw2Amp5Zo",
  authDomain: "pulse-807c4.firebaseapp.com",
  projectId: "pulse-807c4",
  storageBucket: "pulse-807c4.firebasestorage.app",
  messagingSenderId: "195546473872",
  appId: "1:195546473872:web:757899b29d52208f8cff15"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }