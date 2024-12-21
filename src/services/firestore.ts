import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export const firestoreService = {
  // Create or update a document
  setDocument: async <T extends { id: string }>(
    collectionName: string,
    data: T
  ): Promise<void> => {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data);
  },

  // Get a single document
  getDocument: async <T>(
    collectionName: string,
    id: string
  ): Promise<T | null> => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  },

  // Get all documents from a collection
  getCollection: async <T>(collectionName: string): Promise<T[]> => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
  },

  // Delete a document
  deleteDocument: async (
    collectionName: string,
    id: string
  ): Promise<void> => {
    await deleteDoc(doc(db, collectionName, id));
  }
};