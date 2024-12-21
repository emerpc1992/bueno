import { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestore';

export function useFirestore<T extends { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await firestoreService.getCollection<T>(collectionName);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Add or update document
  const saveDocument = async (document: T) => {
    try {
      await firestoreService.setDocument(collectionName, document);
      await loadData(); // Reload data after save
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error saving document'));
      return false;
    }
  };

  // Delete document
  const deleteDocument = async (id: string) => {
    try {
      await firestoreService.deleteDocument(collectionName, id);
      await loadData(); // Reload data after delete
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error deleting document'));
      return false;
    }
  };

  return {
    data,
    loading,
    error,
    saveDocument,
    deleteDocument,
    refresh: loadData
  };
}