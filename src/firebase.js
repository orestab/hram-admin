import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASkaqU7qZbBbv2L2G-pm-r7NhKZULhAfo",
  authDomain: "hram-sofia-239f5.firebaseapp.com",
  databaseURL: "https://hram-sofia-239f5-default-rtdb.firebaseio.com",
  projectId: "hram-sofia-239f5",
  storageBucket: "hram-sofia-239f5.firebasestorage.app",
  messagingSenderId: "208433087665",
  appId: "1:208433087665:web:66813eb81aceb040f8ce90",
  measurementId: "G-CMJNW1B8TV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);