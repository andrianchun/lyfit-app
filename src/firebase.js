// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// TODO: Nanti kamu harus mengganti teks "KODE_RAHASIA_..." ini 
// dengan kode asli dari akun Firebase Console milikmu.
const firebaseConfig = {
  apiKey: "AIzaSyCHyEzi6EH9gxJnnUgCSagCWwQKtIQfMKU",
  authDomain: "lyfit-andrian.firebaseapp.com",
  projectId: "lyfit-andrian",
  storageBucket: "lyfit-andrian.firebasestorage.app",
  messagingSenderId: "594058185444",
  appId: "1:594058185444:web:fd2aa6eabcf878dd9cbaf1"
};

// Menyalakan Mesin
const app = initializeApp(firebaseConfig);

// Menyalakan Fitur Login/Register
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Menyalakan Fitur Database Master
export const db = getFirestore(app);

// Aktifkan Offline Persistence (PWA)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
  } else if (err.code === 'unimplemented') {
    console.warn("The current browser does not support all of the features required to enable persistence");
  }
});