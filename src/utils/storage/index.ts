import { firestore } from '../firebase/core';
import { Product } from '../../types/product';
import { Client } from '../../types/client';
import { Staff } from '../../types/staff';
import { Sale } from '../../types/sale';
import { Appointment } from '../../types/appointment';
import { Expense } from '../../types/expense';
import { Credit } from '../../types/credit';
import { CashMovement, CashRegister } from '../../types/cash';
import { COLLECTIONS } from '../firebase/collections';

// Default cash register data
const defaultCashRegister: CashRegister = {
  id: 'current',
  amount: 0,
  lastModified: new Date().toISOString()
};

// Enhanced storage operations with proper error handling and retries
const createStorage = <T extends { id: string }>(collectionName: keyof typeof COLLECTIONS) => ({
  save: async (data: T[]): Promise<T[]> => {
    try {
      if (!Array.isArray(data)) {
        console.error(`Invalid data format for ${collectionName}:save - expected array`);
        return [];
      }
      
      // Ensure we're passing a clean array of data
      const cleanData = data.map(item => ({
        ...item,
        id: item.id || Date.now().toString()
      }));
      
      const result = await firestore.save(collectionName, cleanData);
      return result || [];
    } catch (error) {
      console.error(`Error saving ${collectionName}:`, error);
      return [];
    }
  },
  load: async (): Promise<T[]> => {
    try {
      const data = await firestore.loadAll<T>(collectionName);
      return data.filter(item => item && item.id);
    } catch (error) {
      console.error(`Error loading ${collectionName}:`, error);
      return [];
    }
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      return await firestore.delete(collectionName, id);
    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      return false;
    }
  },
});

// Export storage operations
export const storage = {
  products: createStorage<Product>(COLLECTIONS.PRODUCTS),
  clients: createStorage<Client>(COLLECTIONS.CLIENTS),
  staff: createStorage<Staff>(COLLECTIONS.STAFF),
  sales: createStorage<Sale>(COLLECTIONS.SALES),
  appointments: createStorage<Appointment>(COLLECTIONS.APPOINTMENTS),
  expenses: createStorage<Expense>(COLLECTIONS.EXPENSES),
  credits: createStorage<Credit>(COLLECTIONS.CREDITS),
  cashMovements: createStorage<CashMovement>(COLLECTIONS.CASH_MOVEMENTS),
  cashRegister: {
    save: async (data: CashRegister): Promise<boolean> => {
      try {
        const cleanData = {
          ...data,
          id: 'current',
          lastModified: new Date().toISOString(),
          amount: Number(data.amount) || 0
        };
        
        const result = await firestore.save(COLLECTIONS.CASH_REGISTER, [cleanData]);
        return result !== null;
      } catch (error) {
        console.error('Error saving cash register:', error);
        return false;
      }
    },
    load: async (): Promise<CashRegister> => {
      try {
        const result = await firestore.loadOne<CashRegister>(COLLECTIONS.CASH_REGISTER, 'current');
        const data = result || defaultCashRegister;
        
        // Ensure all required fields exist
        const validatedData = {
          ...defaultCashRegister,
          ...data,
          id: 'current',
          lastModified: data.lastModified || new Date().toISOString()
        };
        
        return validatedData;
      } catch (error) {
        console.error('Error loading cash register:', error);
        return defaultCashRegister;
      }
    },
    reset: async (): Promise<boolean> => {
      try {
        return await storage.cashRegister.save(defaultCashRegister);
      } catch (error) {
        console.error('Error resetting cash register:', error);
        return false;
      }
    },
  }
};