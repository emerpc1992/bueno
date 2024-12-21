import { Sale } from '../types/sale';
import { Product } from '../types/product';
import { Expense } from '../types/expense';
import { Credit } from '../types/credit';

export interface FinancialMetrics {
  inventoryCost: number;
  totalSales: number;
  totalExpenses: number;
  costOfSales: number;
  netProfit: number;
  cashBalance: number;
  totalProfit: number;
  cashPayments: number;
  cardPayments: number;
  transferPayments: number;
  creditTotal: number;
  creditPaid: number;
  creditPending: number;
  creditProfit: number;
}

const isDateInRange = (date: string, startDate: string, endDate: string): boolean => {
  try {
    if (!date) return false;
    
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    end.setHours(23, 59, 59, 999);
    
    if (isNaN(checkDate.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid date in range check:', { date, startDate, endDate });
      return false;
    }
    
    return checkDate >= start && checkDate <= end;
  } catch (error) {
    console.error('Error checking date range:', {
      date,
      startDate,
      endDate,
      error: error instanceof Error ? error.message : error
    });
    return false;
  }
};

export const calculateFinancialMetrics = (
  filteredSales: Sale[],
  products: Product[],
  expenses: Expense[],
  credits: Credit[],
  startDate: string,
  endDate: string
): FinancialMetrics => {
  // Calculate inventory cost
  const inventoryCost = products.reduce((total, product) => 
    total + (product.costPrice * product.quantity), 0);

  // Return default metrics if no sales
  if (!Array.isArray(filteredSales) || filteredSales.length === 0) {
    return {
      inventoryCost,
      totalSales: 0,
      totalExpenses: 0,
      costOfSales: 0,
      netProfit: 0,
      cashBalance: 0,
      totalProfit: 0,
      cashPayments: 0,
      cardPayments: 0,
      transferPayments: 0,
      creditTotal: 0,
      creditPaid: 0,
      creditPending: 0,
      creditProfit: 0
    };
  }

  // Calculate credit metrics
  const creditMetrics = credits
    .filter(credit => isDateInRange(credit.createdAt, startDate, endDate) && credit.status !== 'cancelled')
    .reduce((metrics, credit) => {
      const totalPaid = credit.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const paymentRatio = totalPaid / credit.finalPrice;
      const totalPotentialProfit = credit.finalPrice - credit.originalPrice;
      const realizedProfit = totalPotentialProfit * paymentRatio;
      
      return {
        total: metrics.total + credit.finalPrice,
        paid: metrics.paid + totalPaid,
        pending: metrics.pending + (credit.finalPrice - totalPaid),
        profit: metrics.profit + realizedProfit
      };
    }, { total: 0, paid: 0, pending: 0, profit: 0 });

  // Calculate sales metrics
  const totalSales = filteredSales.reduce((total, sale) => total + sale.total, 0);
  
  const costOfSales = filteredSales.reduce((total, sale) => 
    total + sale.products.reduce((cost, product) => 
      cost + (product.originalPrice * product.quantity), 0), 0);

  // Calculate expenses
  const totalExpenses = expenses
    .filter(expense => expense.status === 'active' && isDateInRange(expense.date, startDate, endDate))
    .reduce((total, expense) => total + expense.amount, 0);

  // Calculate payment method totals
  const paymentTotals = filteredSales.reduce((totals, sale) => {
    const amount = Number(sale.total) || 0;
    switch (sale.paymentMethod) {
      case 'cash': return { ...totals, cash: totals.cash + amount };
      case 'card': return { ...totals, card: totals.card + amount };
      case 'transfer': return { ...totals, transfer: totals.transfer + amount };
      default: return totals;
    }
  }, { cash: 0, card: 0, transfer: 0 });

  const netProfit = totalSales - costOfSales - totalExpenses;
  const totalProfit = netProfit + creditMetrics.profit;

  return {
    inventoryCost,
    totalSales,
    totalExpenses,
    costOfSales,
    netProfit,
    cashBalance: totalSales - totalExpenses,
    totalProfit,
    cashPayments: paymentTotals.cash,
    cardPayments: paymentTotals.card,
    transferPayments: paymentTotals.transfer,
    creditTotal: creditMetrics.total,
    creditPaid: creditMetrics.paid,
    creditPending: creditMetrics.pending,
    creditProfit: creditMetrics.profit
  };
};