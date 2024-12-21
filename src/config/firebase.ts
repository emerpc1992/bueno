import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-yyoJqi8AYcVVAb9btqmhhNCS8cqOILY",
  authDomain: "alvarosalon25.firebaseapp.com",
  projectId: "alvarosalon25",
  storageBucket: "alvarosalon25.appspot.com",
  messagingSenderId: "845724066967",
  appId: "1:845724066967:web:9989feba852e6cbf00b5d2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);