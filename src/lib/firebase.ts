import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "your-secret-crush",
  appId: "1:1038423347945:web:b849722725c228be899678",
  storageBucket: "your-secret-crush.firebasestorage.app",
  apiKey: "AIzaSyCZum1Slw53RoVTqup-RyKYKSPCUQJH3T8",
  authDomain: "your-secret-crush.firebaseapp.com",
  messagingSenderId: "1038423347945",
  measurementId: "G-H9C6Y2FPJP",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

