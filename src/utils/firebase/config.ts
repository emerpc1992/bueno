import { Firestore } from 'firebase/firestore';
import { isValidConfig, loadFirebaseConfig, initializeFirebase } from '../firebaseConfig';

let db: Firestore | null = null;

const initializeDb = async () => {
  const config = loadFirebaseConfig();
  
  if (!isValidConfig(config)) {
    console.warn('Invalid Firebase configuration');
    return null;
  }

  db = await initializeFirebase(config);
  return db;
};

// Initialize Firebase on first import
initializeDb().catch(console.error);

export { db };
export default db;