// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyArhemkQOjwVE3tHaBI0vvmpE8Dhh7Obys",
    authDomain: "recette-cuisine-4919f.firebaseapp.com",
    projectId: "recette-cuisine-4919f",
    storageBucket: "recette-cuisine-4919f.firebasestorage.app",
    messagingSenderId: "1029406777752",
    appId: "1:1029406777752:web:9edfeaedd62b7d71e94bed"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
