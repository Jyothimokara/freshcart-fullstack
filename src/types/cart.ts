import type { Product } from './product';

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  appliedCoupon?: string;
}
