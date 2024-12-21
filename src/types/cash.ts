export interface CashRegister {
  amount: number;
  lastModified: string;
}

export interface CashMovement {
  id: string;
  date: string;
  type: 'add' | 'subtract';
  amount: number;
  reason: string;
}