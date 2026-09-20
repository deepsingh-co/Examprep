import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCaWjSzWmdb3TZEQV7lIy5Aw2GHb5ve8rY",
  authDomain: "examprep-af3d0.firebaseapp.com",
  projectId: "examprep-af3d0",
  storageBucket: "examprep-af3d0.firebasestorage.app",
  messagingSenderId: "649352596962",
  appId: "1:649352596962:web:4314bbc667546cbe4bfdbb",
  measurementId: "G-SBMD723NSL"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
