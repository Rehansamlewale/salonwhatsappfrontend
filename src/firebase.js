// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// Import the functions you need from the SDKs you need

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJrKdr21AuuZam1k-MS3nTyzj4IwPLlhU",
  authDomain: "whatsapp-salon-1b4b7.firebaseapp.com",
  databaseURL: "https://whatsapp-salon-1b4b7-default-rtdb.firebaseio.com/",
  projectId: "whatsapp-salon-1b4b7",
  storageBucket: "whatsapp-salon-1b4b7.firebasestorage.app",
  messagingSenderId: "422637529994",
  appId: "1:422637529994:web:ebaf15c99de6518c333673",
  measurementId: "G-6D2SSBB9ZN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize all services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Realtime Database only if databaseURL is provided
let database = null;
try {
  if (firebaseConfig.databaseURL) {
    database = getDatabase(app);
  }
} catch (error) {
  
}

// Export everything at once
export { app, analytics, auth, db, storage, database };
