import { Sale } from '../types/sale';
import { formatCurrency } from './format';
import { loadReceiptConfig } from './receiptConfig';

export const generateReceiptHTML = (sale: Sale): string => {
  const config = loadReceiptConfig();
  const date = new Date(sale.date).toLocaleDateString('es-NI', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const paymentMethods: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia'
  };

  return `
    <div class="receipt" style="
      font-family: 'Courier New', monospace;
      max-width: ${config.paperSize.width}mm;
      margin: 0 auto;
      padding: 10mm;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    ">
      <div style="text-align: center; margin-bottom: 5mm;">
        <h1 style="
          font-size: ${config.fontSize.title}pt;
          margin: 0;
          margin-bottom: 2mm;
        ">${config.businessInfo.name}</h1>
        <div style="
          font-size: ${config.fontSize.subtitle}pt;
          margin-bottom: 2mm;
        ">${config.businessInfo.subtitle}</div>
        ${config.businessInfo.address ? `
          <div style="font-size: ${config.fontSize.body}pt;">
            ${config.businessInfo.address}
          </div>
        ` : ''}
        ${config.businessInfo.phone ? `
          <div style="font-size: ${config.fontSize.body}pt;">
            Tel: ${config.businessInfo.phone}
          </div>
        ` : ''}
        ${config.businessInfo.email ? `
          <div style="font-size: ${config.fontSize.body}pt;">
            ${config.businessInfo.email}
          </div>
        ` : ''}
      </div>

      <div style="margin-bottom: 5mm; font-size: ${config.fontSize.body}pt;">
        <div>Factura #${String(sale.invoiceNumber).padStart(6, '0')}</div>
        <div>Fecha: ${date}</div>
        <div>Cliente: ${sale.clientName}</div>
        ${sale.clientCode ? `<div>Código: ${sale.clientCode}</div>` : ''}
      </div>

      <table style="
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 5mm;
        font-size: ${config.fontSize.body}pt;
      ">
        <thead>
          <tr style="border-bottom: 1px solid #000;">
            <th style="text-align: left;">Producto</th>
            <th style="text-align: right;">Cant.</th>
            <th style="text-align: right;">Precio</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${sale.products.map(product => `
            <tr>
              <td style="padding: 1mm 0;">${product.name}</td>
              <td style="text-align: right;">${product.quantity}</td>
              <td style="text-align: right;">${formatCurrency(product.finalPrice)}</td>
              <td style="text-align: right;">${formatCurrency(product.finalPrice * product.quantity)}</td>
            </tr>
          `).join('')}
          <tr style="border-top: 1px solid #000;">
            <td colspan="3" style="text-align: right; padding-top: 2mm;">Subtotal:</td>
            <td style="text-align: right; padding-top: 2mm;">${formatCurrency(sale.subtotal)}</td>
          </tr>
          ${sale.discount > 0 ? `
            <tr>
              <td colspan="3" style="text-align: right;">Descuento:</td>
              <td style="text-align: right;">-${formatCurrency(sale.discount)}</td>
            </tr>
          ` : ''}
          <tr>
            <td colspan="3" style="text-align: right; font-weight: bold;">Total:</td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(sale.total)}</td>
          </tr>
        </tbody>
      </table>

      <div style="
        margin-bottom: 5mm;
        font-size: ${config.fontSize.body}pt;
      ">
        <div>Método de pago: ${paymentMethods[sale.paymentMethod]}</div>
        ${sale.reference ? `<div>Referencia: ${sale.reference}</div>` : ''}
      </div>

      <div style="
        text-align: center;
        margin-top: 10mm;
        font-size: ${config.fontSize.body}pt;
      ">
        ¡Gracias por su preferencia!
      </div>
    </div>
  `;
};

// Alias for backward compatibility
export const generateReceipt = generateReceiptHTML;