import { collection, doc, setDoc, getDoc, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import { WithId } from './core';

// Enhanced delete operation with proper error handling
const enhancedDelete = async (collectionName: string, id: string): Promise<boolean> => {
  if (!db) return false;
  
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    return false;
  }
};

// Enhanced save operation with proper batch handling
const enhancedSave = async <T extends WithId>(
  collectionName: string,
  data: T[]
): Promise<boolean> => {
  if (!db) return false;

  try {
    const batch = writeBatch(db);
    const colRef = collection(db, collectionName);
    
    // Get existing documents
    const snapshot = await getDocs(colRef);
    
    // Delete documents not in new data
    const existingIds = snapshot.docs.map(doc => doc.id);
    const newIds = data.map(item => item.id);
    
    existingIds.forEach(id => {
      if (!newIds.includes(id)) {
        const docRef = doc(db, collectionName, id);
        batch.delete(docRef);
      }
    });
    
    // Add or update new data
    data.forEach(item => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item);
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error(`Error in batch operation for ${collectionName}:`, error);
    return false;
  }
};

// Enhanced load operation with error handling
const enhancedLoad = async <T extends WithId>(collectionName: string): Promise<T[]> => {
  if (!db) return [];
  
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as T));
  } catch (error) {
    console.error(`Error loading ${collectionName}:`, error);
    return [];
  }
};

// Create operations for each collection
const createOperations = <T extends WithId>(collectionName: string) => ({
  save: async (data: T[]): Promise<boolean> => enhancedSave(collectionName, data),
  load: async (): Promise<T[]> => enhancedLoad<T>(collectionName),
  delete: async (id: string): Promise<boolean> => enhancedDelete(collectionName, id)
});

// Export database operations
export const db_operations = Object.fromEntries(
  Object.entries(COLLECTIONS).map(([key, value]) => [
    key.toLowerCase(),
    createOperations(value)
  ])
) as Record<string, ReturnType<typeof createOperations>>;