// Collection names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CLIENTS: 'clients',
  STAFF: 'staff',
  SALES: 'sales',
  APPOINTMENTS: 'appointments',
  EXPENSES: 'expenses',
  CREDITS: 'credits',
  CASH_REGISTER: 'cashRegister',
  CASH_MOVEMENTS: 'cashMovements'
} as const;

export type CollectionName = keyof typeof COLLECTIONS;