import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwGOaPu9u2pT4GOtbstcY0nN2eRaRfL3M",
  authDomain: "gen-lang-client-0606503029.firebaseapp.com",
  projectId: "gen-lang-client-0606503029",
  storageBucket: "gen-lang-client-0606503029.firebasestorage.app",
  messagingSenderId: "311546092039",
  appId: "1:311546092039:web:b014ffd52f70dbedaca8a2"
};

// In AI Studio, the firebase-applet-config.json contains the correct config.
// However, the platform usually injects these. 
// For now, I will use a placeholder or try to read from the config file if possible.
// Actually, the best way is to import it if it's available.

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
