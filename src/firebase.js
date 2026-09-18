// src/firebase.js
// Universal re-export to support both '../firebase' and '../firebase/config' import paths

export {
  firebaseApp,
  firebaseApp as app,
  auth,
  db,
  storage,
  functions,
  analytics,
  isFirebaseConfigured,
} from './firebase/config';

import { firebaseApp } from './firebase/config';
export default firebaseApp;
