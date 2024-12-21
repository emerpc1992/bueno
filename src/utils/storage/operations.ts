import { collection, doc, deleteDoc, getDocs, writeBatch, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { WithId } from '../firebase/core';
import { retryOperation } from './helpers';

const COLLECTIONS = {
  products: 'products',
  categories: 'categories',
  clients: 'clients',
  staff: 'staff',
  sales: 'sales',
  appointments: 'appointments',
  expenses: 'expenses',
  credits: 'credits',
  cashMovements: 'cashMovements',
  cashRegister: 'cashRegister'
};

const retry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T | null> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  return null;
};

// Enhanced save operation with proper batch handling and retries
export const enhancedSave = async <T extends WithId>(
  collectionName: string,
  data: T[],
  maxRetries = 3
): Promise<boolean> => {
  if (!db) return false;
  
  // Validate collection name
  if (!COLLECTIONS[collectionName as keyof typeof COLLECTIONS]) {
    console.error(`Invalid collection name: ${collectionName}`);
    return false;
  }

  // Handle empty array case - clear collection
  if (data.length === 0) {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      
      if (snapshot.size > 0) {
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
      
      return true;
    } catch (error) {
      console.error(`Error clearing collection ${collectionName}:`, error);
      return false;
    }
  }

  const operation = async () => {
    const batch = writeBatch(db);
    const colRef = collection(db, collectionName);
    
    const snapshot = await getDocs(colRef);
    
    const existingIds = snapshot.docs.map(doc => doc.id);
    const newIds = data.map(item => item.id);
    
    // Delete documents that are not in the new data
    existingIds.forEach(id => {
      if (!newIds.includes(id)) {
        const docRef = doc(db, collectionName, id);
        batch.delete(docRef);
      }
    });
    
    // Add or update documents
    data.forEach(item => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, { ...item });
    });

    await batch.commit();
    return true;
  };

  const result = await retry(operation, maxRetries);
  return result ?? false;
};

// Enhanced save single document operation
export const enhancedSaveDoc = async <T extends WithId>(
  collectionName: string,
  data: T,
  maxRetries = 3
): Promise<boolean> => {
  if (!db) return false;

  const operation = async () => {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, { ...data });
    return true;
  };

  return retry(operation, maxRetries) ?? false;
};

// Enhanced delete operation
export const enhancedDelete = async (
  collectionName: string,
  id: string,
  maxRetries = 3
): Promise<boolean> => {
  if (!db) return false;

  const operation = async () => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  };

  return retry(operation, maxRetries) ?? false;
};

// Enhanced load operation with error handling
export const enhancedLoad = async <T extends WithId>(
  collectionName: string
): Promise<T[]> => {
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

// Enhanced load single document operation
export const enhancedLoadDoc = async <T extends WithId>(
  collectionName: string,
  id: string
): Promise<T | null> => {
  if (!db) return null;
  
  try {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      ...snapshot.data(),
      id: snapshot.id
    } as T;
  } catch (error) {
    console.error(`Error loading document from ${collectionName}:`, error);
    return null;
  }
};