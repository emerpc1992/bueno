import { db_operations } from './firebase/operations';
import { Product } from '../types/product';
import { Client } from '../types/client';
import { Staff } from '../types/staff';
import { Sale } from '../types/sale';
import { Appointment } from '../types/appointment';
import { Expense } from '../types/expense';
import { Credit } from '../types/credit';
import { CashMovement, CashRegister } from '../types/cash';
import { Category } from '../types/product';
import { WithId } from './firebase/core';
import { enhancedSave, enhancedLoad, enhancedDelete, enhancedSaveDoc, enhancedLoadDoc } from './storage/operations';

// Default cash register data
const defaultCashRegister: CashRegister = {
  id: 'current',
  amount: 0,
  lastModified: new Date().toISOString()
};

// Create storage operations with proper error handling
const createStorage = <T extends WithId>(collectionName: keyof typeof db_operations) => ({
  save: async (data: T[]): Promise<boolean> => {
    try {
      // Handle null/undefined case
      if (data === null || data === undefined) {
        console.error('Invalid data format: expected array');
        return false;
      }
      
      // Ensure data is an array
      const arrayData = Array.isArray(data) ? data : [];
      
      return await enhancedSave(collectionName, data, 3);
    } catch (error) {
      console.error(`Error saving ${collectionName}:`, error);
      return false;
    }
  },
  load: async (): Promise<T[]> => {
    try {
      const data = await enhancedLoad<T>(collectionName);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error loading ${collectionName}:`, error);
      return [];
    }
  },
  delete: async (id: string): Promise<boolean> => {
    try {
      const result = await enhancedDelete(collectionName, id, 3);
      if (result) {
        console.log(`Successfully deleted document ${id} from ${collectionName}`);
      }
      return result;
    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      return false;
    }
  }
});

// Export storage operations
export const storage = {
  products: createStorage<Product>('products'),
  categories: createStorage<Category>('categories'),
  clients: createStorage<Client>('clients'),
  staff: createStorage<Staff>('staff'),
  sales: createStorage<Sale>('sales'),
  appointments: createStorage<Appointment>('appointments'),
  expenses: createStorage<Expense>('expenses'),
  credits: createStorage<Credit>('credits'),
  cashMovements: createStorage<CashMovement>('cashMovements'),
  cashRegister: {
    save: async (data: CashRegister): Promise<boolean> => {
      try {
        return await enhancedSaveDoc('cashRegister', {
          ...data,
          id: 'current',
          lastModified: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error saving cash register:', error);
        return false;
      }
    },
    load: async (): Promise<CashRegister> => {
      try {
        const data = await enhancedLoadDoc<CashRegister>('cashRegister', 'current');
        return data || defaultCashRegister;
      } catch (error) {
        console.error('Error loading cash register:', error);
        return defaultCashRegister;
      }
    }
  }
};

// Initialize empty records after storage is defined
export const clearAllRecords = async () => {
  try {
    await Promise.all([
      storage.appointments.save([]),
      storage.clients.save([]),
      storage.expenses.save([]),
      storage.credits.save([])
    ]);
    console.log('Records cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing records:', error);
    return false;
  }
};