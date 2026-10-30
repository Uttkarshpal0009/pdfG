import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
apiKey: "AIzaSyB--ENed6P-iyM7HiO3R4wJknT3kxsBZRw",
authDomain: "pdfg-39e35.firebaseapp.com",
projectId: "pdfg-39e35",
storageBucket: "pdfg-39e35.firebasestorage.app",
messagingSenderId: "481653732421",
appId: "1:481653732421:web:99cfb76966cadb821f5f2c",
measurementId: "G-PKY6M627JX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);