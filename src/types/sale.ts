export interface SaleProduct {
  id: string;
  code: string;
  name: string;
  quantity: number;
  originalPrice: number;
  finalPrice: number;
  category: string;
}

export interface Sale {
  id: string;
  invoiceNumber: number;
  date: string;
  clientName: string;
  clientCode?: string;
  products: SaleProduct[];
  staffId?: string;
  staffName?: string;
  staffCommission?: number;
  staffCommissionRate?: number;
  staffDiscount?: {
    amount: number;
    reason: string;
    date: string;
    status: 'active' | 'cancelled';
    cancellationReason?: string;
  };
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  reference?: string;
  status: 'active' | 'cancelled';
  cancellationReason?: string;
}