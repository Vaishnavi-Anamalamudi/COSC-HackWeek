import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { isFirebaseConfigured } from '../utils/helpers.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseReady = isFirebaseConfigured();
export const app = firebaseReady ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const googleProvider = new GoogleAuthProvider();

export const authApi = {
  onChange(callback) {
    if (!auth) return () => callback(null);
    return onAuthStateChanged(auth, callback);
  },
  signInGoogle() {
    return signInWithPopup(auth, googleProvider);
  },
  signInEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },
  registerEmail(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  },
  guest() {
    return auth ? signInAnonymously(auth) : Promise.resolve({ user: null });
  },
  logout() {
    return auth ? signOut(auth) : Promise.resolve();
  },
};

export const capsuleCollection = () => collection(db, 'capsules');
export const capsuleDoc = (id) => doc(db, 'capsules', id);

export function subscribeToUserCapsules(userId, callback, onError) {
  const q = query(capsuleCollection(), where('ownerId', '==', userId), orderBy('unlockAt', 'asc'));
  return onSnapshot(q, callback, onError);
}

export function addCapsule(data) {
  return addDoc(capsuleCollection(), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export function updateCapsule(id, data) {
  return updateDoc(capsuleDoc(id), { ...data, updatedAt: serverTimestamp() });
}

export function removeCapsule(id) {
  return deleteDoc(capsuleDoc(id));
}
