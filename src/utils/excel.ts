import * as XLSX from 'xlsx';
import { Product } from '../types/product';

export const exportToExcel = (products: Product[]) => {
  // Prepare data for export
  const exportData = products.map(product => ({
    'Código': product.code,
    'Nombre': product.name,
    'Cantidad': product.quantity,
    'Precio de Costo': product.costPrice,
    'Precio de Venta': product.salePrice,
    'Categoría': product.category,
    'URL de Imagen': product.imageUrl || '',
    'Alerta Stock Bajo': product.lowStockThreshold
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Productos');

  // Generate and download file
  XLSX.writeFile(wb, 'productos.xlsx');
};

export const importFromExcel = async (file: File): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map Excel data to Product type
        const products: Product[] = jsonData.map((row: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          code: row['Código']?.toString() || '',
          name: row['Nombre']?.toString() || '',
          quantity: Number(row['Cantidad']) || 0,
          costPrice: Number(row['Precio de Costo']) || 0,
          salePrice: Number(row['Precio de Venta']) || 0,
          category: row['Categoría']?.toString() || '',
          imageUrl: row['URL de Imagen']?.toString() || '',
          lowStockThreshold: Number(row['Alerta Stock Bajo']) || 5
        }));

        // Validate imported data
        const errors = products.reduce((acc: string[], product, index) => {
          if (!product.code) acc.push(`Fila ${index + 2}: Código es requerido`);
          if (!product.name) acc.push(`Fila ${index + 2}: Nombre es requerido`);
          if (product.quantity < 0) acc.push(`Fila ${index + 2}: Cantidad no puede ser negativa`);
          if (product.costPrice <= 0) acc.push(`Fila ${index + 2}: Precio de costo debe ser mayor a 0`);
          if (product.salePrice <= 0) acc.push(`Fila ${index + 2}: Precio de venta debe ser mayor a 0`);
          if (product.salePrice <= product.costPrice) {
            acc.push(`Fila ${index + 2}: Precio de venta debe ser mayor al precio de costo`);
          }
          if (!product.category) acc.push(`Fila ${index + 2}: Categoría es requerida`);
          return acc;
        }, []);

        if (errors.length > 0) {
          throw new Error('Errores en el archivo:\n' + errors.join('\n'));
        }

        resolve(products);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsArrayBuffer(file);
  });
};