export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  category: string;
  reason: string;
  amount: number;
  note?: string;
  date: string;
  status: 'active' | 'cancelled';
  cancellationReason?: string;
}