export interface Purchase {
  id: string;
  date: string;
  total: number;
  products: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface Client {
  id: string;
  code: string;
  name: string;
  phone: string;
  purchases: Purchase[];
}