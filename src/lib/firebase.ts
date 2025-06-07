import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics"; // Uncomment if needed

const firebaseConfig = {
  apiKey: "AIzaSyDgEVe2HEEmY-iBoQATziEKhJXc2c9IBn4",
  authDomain: "anglican-church-b853f.firebaseapp.com",
  projectId: "anglican-church-b853f",
  storageBucket: "anglican-church-b853f.appspot.com",
  messagingSenderId: "923042383144",
  appId: "1:923042383144:web:bcc528b444d659496ffc1d",
  measurementId: "G-5VVFDJEV33" // Uncomment if needed
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
// const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null; // Uncomment if needed and handle server