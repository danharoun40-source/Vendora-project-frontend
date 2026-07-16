import { Product } from './product.model';

export interface CartItem {
  product: Product | string;
  quantity: number;
  _id?: string;
}

export interface Cart {
  _id: string;
  user: string;
  products: CartItem[];
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}
