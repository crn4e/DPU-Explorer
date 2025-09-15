// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "dpu-explorer",
  "appId": "1:706173066492:web:0d701bbd2844a2c89e0b79",
  "storageBucket": "dpu-explorer.appspot.com",
  "apiKey": "AIzaSyDVZTfHCjrUgnHkGxF5NnFQINbX2j5v02Q",
  "authDomain": "dpu-explorer.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "706173066492"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
