import { Product } from './product.model';
import { User } from './user.model';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Card';

export interface OrderItem {
  product: Product | string;
  quantity: number;
  _id?: string;
}

export interface Order {
  _id: string;
  user: User | string;
  products: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  products: { product: string; quantity: number }[];
  paymentMethod: PaymentMethod;
}
