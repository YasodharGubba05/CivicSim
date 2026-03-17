import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBfVnXEmZOCCuQwUO-Z51IiA8foFf5AXXg',
  authDomain: 'civicsim-e96cf.firebaseapp.com',
  projectId: 'civicsim-e96cf',
  storageBucket: 'civicsim-e96cf.firebasestorage.app',
  messagingSenderId: '1023429131182',
  appId: '1:1023429131182:web:e4eb8ae312f7300c9b263f',
  measurementId: 'G-3JKTPJJV9R',
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
