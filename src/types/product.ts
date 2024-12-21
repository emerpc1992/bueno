export interface Product {
  id: string;
  code: string;
  name: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  category: string;
  imageUrl?: string;
  lowStockThreshold: number;
}

export interface Category {
  id: string;
  name: string;
}