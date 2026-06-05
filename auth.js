// ========================================
// Firebase Authentication & Firestore
// ========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase config loaded from firebase-config.js
const firebaseConfig = window.__FIREBASE_CONFIG__;

// Initialize Firebase and Auth services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Expose Firebase services globally for script.js
window.__FIREBASE__ = { db, auth, currentUser: null };
window.__FIREBASE_AUTH_READY__ = new Promise((resolve) => {
  window.__FIREBASE_AUTH_RESOLVE__ = resolve;
});

// DOM Elements
const btnLogin = document.getElementById('btn-login');

// 1. Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  // Update global state for script.js
  if (window.__FIREBASE__) {
    window.__FIREBASE__.currentUser = user;
    // Resolve the auth ready promise
    if (window.__FIREBASE_AUTH_RESOLVE__) {
      window.__FIREBASE_AUTH_RESOLVE__(user);
      window.__FIREBASE_AUTH_RESOLVE__ = null;
    }
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
  return crypto.randomUUID();
}

window.__FIREBASE_SAVE_DOC__ = async function(content, title, existingDocId = null, options = null) {
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
    hash: hashEncoded,
    title: title || "Untitled",
    updatedAt: serverTimestamp(),
    ownerUid: user.uid,
    ownerName: user.displayName || "Anonymous",
    ownerPhoto: user.photoURL || "",
  };

  if (options) {
    if (options.isPublicRead !== undefined) docData.isPublicRead = options.isPublicRead;
    if (options.isPublicWrite !== undefined) docData.isPublicWrite = options.isPublicWrite;
  }

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


window.__FIREBASE_DELETE_DOC__ = async function(docId) {
  if (!window.__FIREBASE__ || !window.__FIREBASE__.db) {
    throw new Error("Firestore is not ready.");
  }
  const docRef = doc(db, "shared-docs", docId);
  await deleteDoc(docRef);
};

window.__FIREBASE_DOC_EXISTS__ = async function(docId, uid = window.__FIREBASE__.currentUser?.uid) {
  if (!window.__FIREBASE__ || !window.__FIREBASE__.db) return false;
  const docRef = doc(db, "shared-docs", docId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return false;
  const data = docSnap.data();
  if (uid && data.ownerUid !== uid) return false;
  return true;
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

window.getFirebaseDocDeleter = function() {
  return window.__FIREBASE_DELETE_DOC__ || null;
};

window.getFirebaseDocExistsChecker = function() {
  return window.__FIREBASE_DOC_EXISTS__ || null;
};

window.__FIREBASE_LOGOUT__ = async function() {
  if (!window.__FIREBASE__ || !window.__FIREBASE__.auth) {
    throw new Error("Auth service is not ready.");
  }
  await signOut(window.__FIREBASE__.auth);
};