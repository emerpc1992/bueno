import { Product } from '../types/product';

interface QuantityChange {
  id: string;
  quantity: number;
}

export const updateProductQuantity = (products: Product[], changes: QuantityChange[]): Product[] => {
  return products.map(product => {
    const change = changes.find(c => c.id === product.id);
    if (change) {
      const newQuantity = product.quantity + change.quantity;
      if (newQuantity < 0) {
        throw new Error(`No hay suficiente stock para el producto: ${product.name}`);
      }
      return {
        ...product,
        quantity: newQuantity
      };
    }
    return product;
  });
};