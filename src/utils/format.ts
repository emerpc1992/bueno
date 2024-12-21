export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO'
  }).format(amount);
};