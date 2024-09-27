import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWBUGTt1SuOiBVp8OKDeymRx82ysBrpqw",
  authDomain: "real-book-app.firebaseapp.com",
  projectId: "real-book-app",
  storageBucket: "real-book-app.appspot.com",
  messagingSenderId: "849105207086",
  appId: "1:849105207086:web:30101b065c5a87867804bf",
  measurementId: "G-19XWFPEV44",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { auth };
