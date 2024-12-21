export const COLLECTIONS = {
  PRODUCTS: 'products',
  SALES: 'sales',
  CLIENTS: 'clients',
  APPOINTMENTS: 'appointments',
  EXPENSES: 'expenses',
  STAFF: 'staff',
  CREDITS: 'credits',
  CASH_REGISTER: 'cash_register'
} as const;

export type CollectionName = keyof typeof COLLECTIONS;