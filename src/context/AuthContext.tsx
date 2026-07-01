import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Address, Order } from '../types/user';
import { useDemo } from './DemoContext';
import { useToast } from './ToastContext';
import { RefreshCw } from 'lucide-react';

function adaptOrder(order: any): Order {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    discount: Number(order.discount),
    tax: Number(order.tax),
    total: Number(order.total),
    items: (order.items || []).map((item: any) => ({
      ...item,
      price: Number(item.price),
      quantity: Number(item.quantity)
    }))
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  addresses: Address[];
  orders: Order[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<boolean>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address | null>;
  updateAddress: (id: string, address: Omit<Address, 'id'>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
  createOrder: (address: Address, paymentMethod: string) => Promise<Order>;
  fetchOrders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addLog } = useDemo();
  const { showToast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchAddresses = async () => {
    const accessToken = localStorage.getItem('freshcart_access_token');
    if (!accessToken) {
      setAddresses([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/addresses/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      setAddresses([]);
    }
  };

  // Restore authenticated session on startup
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('freshcart_access_token');
      const refreshToken = localStorage.getItem('freshcart_refresh_token');
      
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/profile/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else if (res.status === 401 && refreshToken) {
          // Token expired, attempt refresh
          const refreshRes = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
          });

          if (refreshRes.ok) {
            const tokenData = await refreshRes.json();
            localStorage.setItem('freshcart_access_token', tokenData.access);
            if (tokenData.refresh) {
              localStorage.setItem('freshcart_refresh_token', tokenData.refresh);
            }
            
            // Retry profile fetch
            const retryRes = await fetch(`${API_BASE_URL}/profile/`, {
              headers: {
                'Authorization': `Bearer ${tokenData.access}`,
                'Content-Type': 'application/json'
              }
            });

            if (retryRes.ok) {
              const userData = await retryRes.json();
              setUser(userData);
            } else {
              localStorage.removeItem('freshcart_access_token');
              localStorage.removeItem('freshcart_refresh_token');
              setUser(null);
            }
          } else {
            localStorage.removeItem('freshcart_access_token');
            localStorage.removeItem('freshcart_refresh_token');
            setUser(null);
          }
        } else {
          localStorage.removeItem('freshcart_access_token');
          localStorage.removeItem('freshcart_refresh_token');
          setUser(null);
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const fetchOrders = async () => {
    const accessToken = localStorage.getItem('freshcart_access_token');
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/orders/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.map(adaptOrder));
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchAddresses();
    } else {
      setOrders([]);
      setAddresses([]);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Login failed. Invalid credentials.', 'error');
        addLog('USER_LOGIN_FAIL', { email, detail: errData.detail });
        return false;
      }

      const data = await res.json();
      localStorage.setItem('freshcart_access_token', data.access);
      localStorage.setItem('freshcart_refresh_token', data.refresh);
      setUser(data.user);
      
      showToast('Welcome Back! Login Successful', 'success');
      addLog('USER_LOGIN', { email, success: true });
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('Connection to server failed.', 'error');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let errorMsg = 'Registration failed.';
        if (errData.email) errorMsg = errData.email[0];
        else if (errData.password) errorMsg = `Password: ${errData.password[0]}`;
        else if (errData.detail) errorMsg = errData.detail;
        showToast(errorMsg, 'error');
        addLog('USER_REGISTER_FAIL', { email, detail: errData });
        return false;
      }

      const data = await res.json();
      localStorage.setItem('freshcart_access_token', data.tokens.access);
      localStorage.setItem('freshcart_refresh_token', data.tokens.refresh);
      setUser(data.user);
      
      showToast('Account created successfully!', 'success');
      addLog('USER_REGISTER', { name, email });
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      showToast('Connection to server failed.', 'error');
      return false;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('freshcart_refresh_token');
    const accessToken = localStorage.getItem('freshcart_access_token');
    
    if (refreshToken && accessToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refresh: refreshToken })
        });
      } catch (err) {
        console.error('Failed to blacklist refresh token on server:', err);
      }
    }

    localStorage.removeItem('freshcart_access_token');
    localStorage.removeItem('freshcart_refresh_token');
    localStorage.removeItem('freshcart_user');
    setUser(null);
    showToast('Logged out successfully.', 'info');
    addLog('USER_LOGOUT');
  };

  const updateProfile = async (name: string, email: string): Promise<boolean> => {
    const accessToken = localStorage.getItem('freshcart_access_token');
    if (!accessToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        showToast('Profile updated successfully!', 'success');
        addLog('USER_PROFILE_UPDATE', { name, email });
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to update profile.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Update profile error:', err);
      showToast('Connection to server failed.', 'error');
      return false;
    }
  };

  const addAddress = async (addressData: Omit<Address, 'id'>): Promise<Address | null> => {
    const accessToken = localStorage.getItem('freshcart_access_token');
    if (!accessToken) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/addresses/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      if (res.ok) {
        const newAddress = await res.json();
        await fetchAddresses();
        addLog('USER_ADDRESS_ADD', { id: newAddress.id, name: newAddress.fullName });
        return newAddress;
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to add address.', 'error');
        return null;
      }
    } catch (err) {
      console.error('Add address error:', err);
      showToast('Connection to server failed.', 'error');
      return null;
    }
  };

  const updateAddress = async (id: string, updatedData: Omit<Address, 'id'>): Promise<boolean> => {
    const accessToken = localStorage.getItem('freshcart_access_token');
    if (!accessToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/addresses/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        await fetchAddresses();
        addLog('USER_ADDRESS_UPDATE', { id });
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to update address.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Update address error:', err);
      showToast('Connection to server failed.', 'error');
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    const accessToken = localStorage.getItem('freshcart_access_token');
    if (!accessToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/addresses/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        await fetchAddresses();
        addLog('USER_ADDRESS_DELETE', { id });
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to delete address.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Delete address error:', err);
      showToast('Connection to server failed.', 'error');
      return false;
    }
  };

  const setDefaultAddress = async (id: string): Promise<boolean> => {
    const accessToken = localStorage.getItem('freshcart_access_token');
    if (!accessToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/addresses/${id}/set-default/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        addLog('USER_ADDRESS_SET_DEFAULT', { id });
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.detail || 'Failed to set default address.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Set default address error:', err);
      showToast('Connection to server failed.', 'error');
      return false;
    }
  };

  const createOrder = async (address: Address, paymentMethod: string): Promise<Order> => {
    const accessToken = localStorage.getItem('freshcart_access_token');
    const res = await fetch(`${API_BASE_URL}/orders/checkout/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address, paymentMethod })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Checkout failed.');
    }

    const orderData = await res.json();
    const adapted = adaptOrder(orderData);
    setOrders((prev) => [adapted, ...prev]);
    addLog('USER_ORDER_CREATED', { id: adapted.id, total: adapted.total });
    return adapted;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 gap-4">
        <RefreshCw className="animate-spin text-emerald-600" size={40} />
        <p className="text-slate-500 font-semibold text-sm animate-pulse">Restoring session...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        addresses,
        orders,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        createOrder,
        fetchOrders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
