import { Sale } from '../types/sale';

export const filterSalesByDate = (sales: Sale[], startDate: string, endDate: string): Sale[] => {
  if (!Array.isArray(sales)) return [];
  
  // Validate input dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Invalid date range:', { startDate, endDate });
    return [];
  }
  
  // Set end date to end of day
  end.setHours(23, 59, 59, 999);
  
  return sales.filter(sale => {
    try {
      if (!sale || !sale.date) {
        console.warn('Invalid sale object:', sale);
        return false;
      }
      
      const saleDate = new Date(sale.date);
      
      // Ensure dates are valid
      if (isNaN(saleDate.getTime())) {
        console.warn('Invalid sale date:', sale.date);
        return false;
      }
      
      return saleDate >= start && saleDate <= end && sale.status === 'active';
    } catch (error) {
      console.error('Error filtering sale:', { 
        saleId: sale?.id,
        date: sale?.date,
        error: error instanceof Error ? error.message : error
      });
      return false;
    }
  });
};