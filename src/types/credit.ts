export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  reference?: string;
}

export interface Credit {
  id: string;
  code: string;
  clientName: string;
  clientPhone: string;
  productId: string;
  productName: string;
  originalPrice: number;
  finalPrice: number;
  dueDate: string;
  installments: number;
  installmentAmount: number;
  payments: Payment[];
  status: 'active' | 'completed' | 'overdue';
  createdAt: string;
}