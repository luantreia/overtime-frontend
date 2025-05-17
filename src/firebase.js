// src/firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // 🔥 ESTA LÍNEA ES CLAVE
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvU-kSz1xhewoJcmwk3tkUkaQ6G9-A8Lo",
  authDomain: "overtime-dodgeball.firebaseapp.com",
  projectId: "overtime-dodgeball",
  storageBucket: "overtime-dodgeball.firebasestorage.app",
  messagingSenderId: "1054945545650",
  appId: "1:1054945545650:web:222458d7a2a40b0f3668ab",
  measurementId: "G-KKZ8JBK5ET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const auth = getAuth(app);