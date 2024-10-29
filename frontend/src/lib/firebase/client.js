// src/lib/firebase/client.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//     appId: import.meta.env.VITE_FIREBASE_APP_ID
// };

const firebaseConfig = {
  apiKey: "AIzaSyAKOBCkJTIt9U0VKS2n5xC_cavkf0uAfB0",
  authDomain: "myproject-3ee81.firebaseapp.com",
  projectId: "myproject-3ee81",
  storageBucket: "myproject-3ee81.appspot.com",
  messagingSenderId: "260302099195",
  appId: "1:260302099195:web:02e9b27570494cb741565e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
