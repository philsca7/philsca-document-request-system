// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAM6sUYRIbqMe0412O-ijCbLmdmsXhZDYM",
  authDomain: "philsca-93561.firebaseapp.com",
  databaseURL: "https://philsca-93561-default-rtdb.firebaseio.com",
  projectId: "philsca-93561",
  storageBucket: "philsca-93561.appspot.com",
  messagingSenderId: "629397649371",
  appId: "1:629397649371:web:3c5b5aee8bac1b04a859fe",
  measurementId: "G-N2YVWFX2XM"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);
