
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyATJlXNiurZDyoC1hHrwV5QvLB6uQ9GvqI",
  authDomain: "moda-27cd3.firebaseapp.com",
  projectId: "moda-27cd3",
  storageBucket: "moda-27cd3.firebasestorage.app",
  messagingSenderId: "412538139426",
  appId: "1:412538139426:web:4a3ee23c5981dcb712ab7b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
