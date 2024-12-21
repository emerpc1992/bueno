import { collection, doc, setDoc, getDoc, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { CollectionName } from './collections';

// Type for objects with ID
export interface WithId {
  id: string;
}

// Error handling utilities
const handleFirebaseError = (error: unknown, context: string): null => {
  console.error(`Firebase Error (${context}):`, error);
  return null;
};

// Retry mechanism
const retry = async <T>(
  operation: () => Promise<T>,
  maxAttempts = 3
): Promise<T | null> => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return null;
};

// Core Firestore operations
export const firestore = {
  save: async <T extends WithId>(collectionName: CollectionName, data: T[]): Promise<T[] | null> => {
    try {
      if (!Array.isArray(data)) return null;
      if (!db) return null;
      if (data.length === 0) return [];
      
      const batch = writeBatch(db);
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      
      // Clean data before saving
      const cleanData = data.map(item => {
        const clean = { ...item };
        Object.keys(clean).forEach(key => {
          if (clean[key] === undefined || clean[key] === null || clean[key] === '') {
            delete clean[key];
          }
          // Convert numeric strings to numbers
          if (typeof clean[key] === 'string' && !isNaN(Number(clean[key]))) {
            clean[key] = Number(clean[key]);
          }
        });
        return clean;
      });
      
      // Delete old documents first
      snapshot.docs.forEach(docSnap => {
        if (!cleanData.some(item => item.id === docSnap.id)) {
          batch.delete(docSnap.ref);
        }
      });
      
      // Then add/update new documents
      cleanData.forEach(item => {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, item);
      });

      await batch.commit();
      return cleanData;
    } catch (error) {
      console.error(`Firebase save error (${collectionName}):`, error);
      return handleFirebaseError(error, `save:${collectionName}`);
    }
  },

  loadAll: async <T extends WithId>(collectionName: CollectionName): Promise<T[]> => {
    try {
      if (!db) return [];

      const colRef = collection(db, collectionName);
      const snapshot = await retry(() => getDocs(colRef));
      if (!snapshot) return [];

      return snapshot.docs
        .filter(doc => doc.exists())
        .map(doc => ({
          ...doc.data(),
          id: doc.id
        } as T));
    } catch (error) {
      return handleFirebaseError(error, `loadAll:${collectionName}`) ?? [];
    }
  },

  loadOne: async <T extends WithId>(collectionName: CollectionName, id: string): Promise<T | null> => {
    try {
      if (!db) return null;

      const docRef = doc(db, collectionName, id);
      const snapshot = await retry(() => getDoc(docRef));
      if (!snapshot?.exists()) return null;
      return { ...snapshot.data(), id: snapshot.id } as T;
    } catch (error) {
      return handleFirebaseError(error, `loadOne:${collectionName}:${id}`);
    }
  },

  delete: async (collectionName: CollectionName, id: string): Promise<boolean> => {
    try {
      if (!db) return false;

      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      return false;
    }
  }
};