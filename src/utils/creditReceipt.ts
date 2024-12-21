import { jsPDF } from 'jspdf';
import { Credit, Payment } from '../types/credit';
import { formatCurrency } from './format';
import { loadReceiptConfig } from './receiptConfig';

export const generateCreditReceipt = (credit: Credit, payment: Payment) => {
  const config = loadReceiptConfig();

  // Initialize with portrait orientation for receipt size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [config.paperSize.width, config.paperSize.height],
    compress: true
  });

  let y = 10; // Starting y position
  const margin = config.paperSize.width * 0.07; // 7% of width as margin

  // Header
  doc.setFontSize(config.fontSize.title);
  const title = config.businessInfo.name;
  const titleWidth = doc.getStringUnitWidth(title) * doc.getFontSize() / doc.internal.scaleFactor;
  doc.text(title, (config.paperSize.width - titleWidth) / 2, y);
  
  y += 5;
  doc.setFontSize(config.fontSize.subtitle);
  const subtitle = config.businessInfo.subtitle;
  const subtitleWidth = doc.getStringUnitWidth(subtitle) * doc.getFontSize() / doc.internal.scaleFactor;
  doc.text(subtitle, (config.paperSize.width - subtitleWidth) / 2, y);

  // Additional business info
  if (config.businessInfo.address) {
    y += 4;
    doc.setFontSize(config.fontSize.body);
    doc.text(config.businessInfo.address, margin, y);
  }

  if (config.businessInfo.phone) {
    y += 4;
    doc.text(`Tel: ${config.businessInfo.phone}`, margin, y);
  }

  if (config.businessInfo.email) {
    y += 4;
    doc.text(config.businessInfo.email, margin, y);
  }

  y += 8;
  doc.setFontSize(config.fontSize.body);
  doc.text(`Código: ${credit.code}`, margin, y);

  y += 4;
  const date = new Date(payment.date).toLocaleDateString('es-NI', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Fecha: ${date}`, margin, y);

  y += 4;
  doc.text(`Cliente: ${credit.clientName}`, margin, y);

  y += 4;
  doc.text(`Teléfono: ${credit.clientPhone}`, margin, y);

  // Product details
  y += 6;
  doc.text('Producto:', margin, y);
  y += 4;
  doc.text(credit.productName, margin, y);

  // Payment details
  y += 6;
  doc.setFontSize(7);
  doc.text('Detalle del Pago', margin, y);

  y += 4;
  const paymentMethods: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia'
  };
  doc.text(`Método: ${paymentMethods[payment.method]}`, margin, y);

  if (payment.reference) {
    y += 4;
    doc.text(`Referencia: ${payment.reference}`, margin, y);
  }

  y += 4;
  doc.text(`Monto Pagado: ${formatCurrency(payment.amount)}`, margin, y);

  // Calculate remaining balance
  const totalPaid = credit.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = credit.finalPrice - totalPaid;

  y += 6;
  doc.text('Resumen del Crédito', margin, y);

  y += 4;
  doc.text(`Monto Total: ${formatCurrency(credit.finalPrice)}`, margin, y);

  y += 4;
  doc.text(`Total Pagado: ${formatCurrency(totalPaid)}`, margin, y);

  y += 4;
  doc.text(`Saldo Pendiente: ${formatCurrency(remaining)}`, margin, y);

  // Thank you message
  y += 8;
  doc.setFontSize(8);
  const thankYou = '¡Gracias por su pago!';
  const thankYouWidth = doc.getStringUnitWidth(thankYou) * doc.getFontSize() / doc.internal.scaleFactor;
  doc.text(thankYou, (70 - thankYouWidth) / 2, y);

  return doc;
};