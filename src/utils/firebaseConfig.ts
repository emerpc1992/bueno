import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { enableIndexedDbPersistence } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const defaultConfig: FirebaseConfig = {
  apiKey: "AIzaSyD-yyoJqi8AYcVVAb9btqmhhNCS8cqOILY",
  authDomain: "alvarosalon25.firebaseapp.com",
  projectId: "alvarosalon25",
  storageBucket: "alvarosalon25.firebasestorage.app",
  messagingSenderId: "845724066967",
  appId: "1:845724066967:web:9989feba852e6cbf00b5d2"
};

// Check if config is valid (all required fields are filled)
export const isValidConfig = (config: FirebaseConfig): boolean => {
  return Object.values(config).every(value => value.trim() !== '');
};

// Initialize Firebase with persistence
export const initializeFirebase = async (config: FirebaseConfig) => {
  try {
    const app = initializeApp(config);
    const db = getFirestore(app);

    // Enable offline persistence
    try {
      await enableIndexedDbPersistence(db);
      console.log('Offline persistence enabled');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence enabled in first tab only');
      } else if (err.code === 'unimplemented') {
        console.warn('Browser doesn\'t support persistence');
      }
    }

    return db;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
};

export const saveFirebaseConfig = (config: FirebaseConfig) => {
  localStorage.setItem('firebaseConfig', JSON.stringify(config));
  // Reload the page to apply new Firebase config
  window.location.reload();
};

export const loadFirebaseConfig = (): FirebaseConfig => {
  try {
    const saved = localStorage.getItem('firebaseConfig');
    if (!saved) return defaultConfig;
    
    const config = JSON.parse(saved);
    return {
      apiKey: config.apiKey ?? defaultConfig.apiKey,
      authDomain: config.authDomain ?? defaultConfig.authDomain,
      projectId: config.projectId ?? defaultConfig.projectId,
      storageBucket: config.storageBucket ?? defaultConfig.storageBucket,
      messagingSenderId: config.messagingSenderId ?? defaultConfig.messagingSenderId,
      appId: config.appId ?? defaultConfig.appId
    };
  } catch (error) {
    console.error('Error loading Firebase config:', error);
    return defaultConfig;
  }
};