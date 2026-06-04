// ========================================
// Firebase Authentication & Firestore
// ========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {

};

// Initialize Firebase and Auth services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Expose Firebase services globally for script.js
window.__FIREBASE__ = { db, auth, currentUser: null };
window.__FIREBASE_RESOLVED__ = false;

// DOM Elements
const btnLogin = document.getElementById('btn-login');

// 1. Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  // Update global state for script.js
  if (window.__FIREBASE__) {
    window.__FIREBASE__.currentUser = user;
    window.__FIREBASE_RESOLVED__ = true;
    // Dispatch custom event so other scripts can react to auth changes
    window.dispatchEvent(new CustomEvent('firebase-auth-changed', { detail: { user } }));
  }
});

// 2. Handle Login button click
if (btnLogin) {
  btnLogin.addEventListener('click', () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Login successful!", result.user);
      })
      .catch((error) => {
        // Ignore errors when the user closes the popup
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
          console.log("User closed the login popup.");
          return;
        }
        console.error("Login error:", error.message);
        alert("Login failed: " + error.message);
      });
  });
}

// ============================================================
// Firestore: Save document to cloud (view-only share link)
// ============================================================
// Generate a short 8-character alphanumeric ID
function _generateShortId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

window.__FIREBASE_SAVE_DOC__ = async function(content, title, existingDocId = null) {
  if (!window.__FIREBASE__ || !window.__FIREBASE__.currentUser) {
    throw new Error("You need to login to save documents to the cloud.");
  }
  const user = window.__FIREBASE__.currentUser;
  
  // TỰ ĐỘNG TẠO MÃ BĂM ĐỂ LƯU XUỐNG DATABASE MAP VỚI ID
  let hashEncoded = "";
  try {
    if (typeof encodeMarkdownForShare === 'function') {
      hashEncoded = encodeMarkdownForShare(content);
    } else if (typeof window.encodeMarkdownForShare === 'function') {
      hashEncoded = window.encodeMarkdownForShare(content);
    }
  } catch (e) {
    console.error("Failed to encode hash before saving to Firestore:", e);
  }

  const docData = {
    content: content,
    hash: hashEncoded, // Thêm trường hash lưu mã băm để phục vụ map dữ liệu nhanh
    title: title || "Untitled",
    mode: "view",
    updatedAt: serverTimestamp(),
    ownerUid: user.uid,
    ownerName: user.displayName || "Anonymous",
    ownerPhoto: user.photoURL || ""
  };

  let docId = existingDocId;
  let docRef;

  if (docId) {
    // Nếu có ID rồi thì cập nhật đè lên document cũ
    docRef = doc(db, "shared-docs", docId);
  } else {
    // Nếu chưa có ID thì tạo ID mới
    docData.createdAt = serverTimestamp();
    docId = _generateShortId();
    docRef = doc(db, "shared-docs", docId);
    
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      docId = _generateShortId();
      docRef = doc(db, "shared-docs", docId);
    }
  }

  await setDoc(docRef, docData, { merge: true });
  return docId;
};

window.__FIREBASE_LOAD_DOC__ = async function(docId) {
  if (!window.__FIREBASE__ || !window.__FIREBASE__.db) {
    throw new Error("Firestore is not ready.");
  }
  const docRef = doc(db, "shared-docs", docId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("Document does not exist or has been deleted.");
  }
  return docSnap.data();
};

window.__FIREBASE_LOAD_MY_DOC__ = async function() {
  if (!window.__FIREBASE__ || !window.__FIREBASE__.currentUser) {
    throw new Error("You need to login to list your documents.");
  }
  const user = window.__FIREBASE__.currentUser;
  const q = query(
    collection(db, "shared-docs"),
    where("ownerUid", "==", user.uid),
    orderBy("updatedAt", "desc"),
    // limit(1)
  );
  const querySnapshot = await getDocs(q);
  const docs = [];
  querySnapshot.forEach((docSnap) => {
    docs.push({ id: docSnap.id, ...docSnap.data() });
  });
  return docs;
};


// ============================================================
// Auth Helper Functions (exposed globally)
// ============================================================
window.isUserLoggedIn = function() {
  return !!(window.__FIREBASE__ && window.__FIREBASE__.currentUser);
};

window.getFirebaseDocSaver = function() {
  return window.__FIREBASE_SAVE_DOC__ || null;
};

window.getFirebaseDocLoader = function() {
  return window.__FIREBASE_LOAD_DOC__ || null;
};

window.getFirebaseDocList = function() {
  return window.__FIREBASE_LOAD_MY_DOC__ || null;
};

window.__FIREBASE_LOGOUT__ = async function() {
  if (!window.__FIREBASE__ || !window.__FIREBASE__.auth) {
    throw new Error("Auth service is not ready.");
  }
  await signOut(window.__FIREBASE__.auth);
};