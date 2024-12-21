import { jsPDF } from 'jspdf';
import { formatCurrency } from './format';

interface FinancialMetrics {
  inventoryCost: number;
  totalSales: number;
  totalExpenses: number;
  costOfSales: number;
  netProfit: number;
  cashPayments: number;
  cardPayments: number;
  transferPayments: number;
  creditTotal: number;
  creditPaid: number;
  creditPending: number;
  creditProfit: number;
}

export const generateFinancialReport = (
  metrics: FinancialMetrics,
  startDate: string,
  endDate: string
) => {
  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(16);
  doc.text('Reporte Financiero', 105, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(12);
  doc.text(`Período: ${new Date(startDate).toLocaleDateString('es-NI')} - ${new Date(endDate).toLocaleDateString('es-NI')}`, 105, y, { align: 'center' });

  // Sections
  const addSection = (title: string, items: { label: string; value: string }[]) => {
    y += 15;
    doc.setFontSize(14);
    doc.text(title, 20, y);
    
    y += 8;
    doc.setFontSize(12);
    items.forEach(item => {
      doc.text(item.label, 30, y);
      doc.text(item.value, 160, y, { align: 'right' });
      y += 7;
    });
  };

  // Sales Section
  addSection('Ventas y Ganancias', [
    { label: 'Ventas Totales:', value: formatCurrency(metrics.totalSales) },
    { label: 'Costo de Ventas:', value: formatCurrency(metrics.costOfSales) },
    { label: 'Gastos:', value: formatCurrency(metrics.totalExpenses) },
    { label: 'Ganancia Neta:', value: formatCurrency(metrics.netProfit) }
  ]);

  // Payment Methods Section
  addSection('Métodos de Pago', [
    { label: 'Efectivo:', value: formatCurrency(metrics.cashPayments) },
    { label: 'Tarjeta:', value: formatCurrency(metrics.cardPayments) },
    { label: 'Transferencia:', value: formatCurrency(metrics.transferPayments) }
  ]);

  // Credits Section
  addSection('Créditos', [
    { label: 'Total en Créditos:', value: formatCurrency(metrics.creditTotal) },
    { label: 'Créditos Pagados:', value: formatCurrency(metrics.creditPaid) },
    { label: 'Créditos Pendientes:', value: formatCurrency(metrics.creditPending) },
    { label: 'Ganancia en Créditos:', value: formatCurrency(metrics.creditProfit) }
  ]);

  // Inventory Section
  addSection('Inventario', [
    { label: 'Valor del Inventario:', value: formatCurrency(metrics.inventoryCost) }
  ]);

  // Footer
  doc.setFontSize(10);
  doc.text(
    `Generado el ${new Date().toLocaleDateString('es-NI', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`,
    105,
    280,
    { align: 'center' }
  );

  return doc;
};