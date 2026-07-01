import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDemo } from './DemoContext';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addLog } = useDemo();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Helper for authenticated fetch calls
  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('freshcart_access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const response = await fetch(`http://127.0.0.1:8000/api/wishlist${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Wishlist API error: ${response.statusText}`);
    }
    return response.json();
  };

  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      showToast('Login Required', 'error');
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  // Sync wishlist when authentication status transitions
  useEffect(() => {
    async function loadWishlist() {
      if (!isAuthenticated) {
        setWishlistIds([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchWithAuth('/');
        setWishlistIds(data);
      } catch (err) {
        console.error('Failed to load wishlist from database:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (productId: string) => {
    if (!requireAuth()) return;
    try {
      const active = !wishlistIds.includes(productId);
      const data = await fetchWithAuth('/', {
        method: 'POST',
        body: JSON.stringify({ productId })
      });
      setWishlistIds(data);
      addLog('WISHLIST_TOGGLE', { id: productId, added: active });
    } catch (err) {
      console.error('Toggle wishlist failed:', err);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistIds.includes(productId);
  };

  const clearWishlist = async () => {
    if (!requireAuth()) return;
    try {
      const data = await fetchWithAuth('/', {
        method: 'POST',
        body: JSON.stringify({ action: 'clear' })
      });
      setWishlistIds(data);
      addLog('WISHLIST_CLEAR');
    } catch (err) {
      console.error('Clear wishlist failed:', err);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist, clearWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
