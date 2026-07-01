import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types/product';
import type { CartState } from '../types/cart';
import { useDemo } from './DemoContext';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartState;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Helper function to adapt product properties from backend Decimal strings to frontend numbers
function adaptProduct(p: any): Product {
  return {
    ...p,
    price: Number(p.price),
    discountPrice: p.discountPrice !== null && p.discountPrice !== undefined && p.discountPrice !== ''
      ? Number(p.discountPrice)
      : undefined,
    rating: Number(p.rating)
  };
}

// Helper function to adapt the entire CartState
function adaptCart(data: any): CartState {
  return {
    items: (data.items || []).map((item: any) => ({
      id: item.id,
      product: adaptProduct(item.product),
      quantity: Number(item.quantity)
    })),
    subtotal: Number(data.subtotal),
    tax: Number(data.tax),
    shipping: Number(data.shipping),
    discount: Number(data.discount),
    total: Number(data.total),
    appliedCoupon: data.appliedCoupon || undefined
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addLog } = useDemo();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [cart, setCart] = useState<CartState>({
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Helper for authenticated fetch calls
  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('freshcart_access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const response = await fetch(`${API_BASE_URL}/cart${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Cart API error: ${response.statusText}`);
    }
    return response.json();
  };

  // Helper to ensure authenticated user before cart operations
  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      showToast('Login Required', 'error');
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  // Sync cart when authentication status transitions
  useEffect(() => {
    async function loadCart() {
      if (!isAuthenticated) {
        setCart({
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const cartData = await fetchWithAuth('/');
        setCart(adaptCart(cartData));
      } catch (err) {
        console.error('Failed to load cart from database:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, [isAuthenticated]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (!requireAuth()) return;
    try {
      const cartData = await fetchWithAuth('/items/', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity })
      });
      setCart(adaptCart(cartData));
      addLog('CART_ITEM_ADD', { id: product.id, name: product.name, quantity });
    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!requireAuth()) return;
    const item = cart.items.find(i => i.product.id === productId);
    if (!item) return;
    try {
      const cartData = await fetchWithAuth(`/items/${item.id}/`, {
        method: 'DELETE'
      });
      setCart(adaptCart(cartData));
      addLog('CART_ITEM_REMOVE', { id: productId });
    } catch (err) {
      console.error('Remove from cart failed:', err);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!requireAuth()) return;
    const item = cart.items.find(i => i.product.id === productId);
    if (!item) return;
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    try {
      const cartData = await fetchWithAuth(`/items/${item.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity })
      });
      setCart(adaptCart(cartData));
      addLog('CART_ITEM_QTY_UPDATE', { id: productId, quantity });
    } catch (err) {
      console.error('Update quantity failed:', err);
    }
  };

  const clearCart = async () => {
    if (!requireAuth()) return;
    try {
      const cartData = await fetchWithAuth('/clear/', {
        method: 'POST'
      });
      setCart(adaptCart(cartData));
      addLog('CART_CLEAR');
    } catch (err) {
      console.error('Clear cart failed:', err);
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!requireAuth()) return false;
    try {
      const cartData = await fetchWithAuth('/apply-coupon/', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      setCart(adaptCart(cartData));
      addLog('CART_COUPON_APPLY', { code, success: true });
      return true;
    } catch (err) {
      console.error('Apply coupon failed:', err);
      addLog('CART_COUPON_APPLY', { code, success: false });
      return false;
    }
  };

  const removeCoupon = async () => {
    if (!requireAuth()) return;
    try {
      const cartData = await fetchWithAuth('/remove-coupon/', {
        method: 'POST'
      });
      setCart(adaptCart(cartData));
      addLog('CART_COUPON_REMOVE');
    } catch (err) {
      console.error('Remove coupon failed:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
