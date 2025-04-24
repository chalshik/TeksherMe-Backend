// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCq9FUW9-OyX9ynkQ91w5VPbkScshGuVy0",
  authDomain: "teksherme-3a2fe.firebaseapp.com",
  projectId: "teksherme-3a2fe",
  storageBucket: "teksherme-3a2fe.firebasestorage.app",
  messagingSenderId: "520480110917",
  appId: "1:520480110917:web:e6e7686679402947a9662c",
  measurementId: "G-QHZVLR87MK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth, firebaseConfig };
