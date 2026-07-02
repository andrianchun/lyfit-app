import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHyEzi6EH9gxJnnUgCSagCWwQKtIQfMKU",
  authDomain: "lyfit-andrian.firebaseapp.com",
  projectId: "lyfit-andrian",
  storageBucket: "lyfit-andrian.firebasestorage.app",
  messagingSenderId: "594058185444",
  appId: "1:594058185444:web:fd2aa6eabcf878dd9cbaf1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const q = query(collection(db, 'community_posts'), limit(10));
    const snap = await getDocs(q);
    console.log("Total posts found:", snap.size);
    snap.forEach(doc => {
      console.log(doc.id, doc.data().isHidden);
    });
  } catch (err) {
    console.error("ERROR:", err);
  }
}

test();
