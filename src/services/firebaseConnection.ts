import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeO42Ac6nfl6qGca4Kd6-58PPPBnqrzOc",
  authDomain: "tarefasplus-23e99.firebaseapp.com",
  projectId: "tarefasplus-23e99",
  storageBucket: "tarefasplus-23e99.appspot.com",
  messagingSenderId: "1043621482888",
  appId: "1:1043621482888:web:b3c5d41cbe6b1b4804ea3d",
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };
