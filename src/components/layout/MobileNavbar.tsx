import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function MobileNavbar() {
  const location = useLocation();
  const { cart } = useCart();
  const cartItemsCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 h-16 px-4 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {/* Home Tab */}
      <Link
        to="/"
        className={`flex flex-col items-center justify-center w-12 h-full gap-1 transition-colors ${
          isActive('/') ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Home size={20} />
        <span className="text-[10px] font-bold">Home</span>
      </Link>

      {/* Categories Tab */}
      <Link
        to="/categories"
        className={`flex flex-col items-center justify-center w-12 h-full gap-1 transition-colors ${
          isActive('/categories') ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Grid size={20} />
        <span className="text-[10px] font-bold">Categories</span>
      </Link>

      {/* Search Tab */}
      <Link
        to="/products"
        className={`flex flex-col items-center justify-center w-12 h-full gap-1 transition-colors ${
          isActive('/products') ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Search size={20} />
        <span className="text-[10px] font-bold">Search</span>
      </Link>

      {/* Cart Tab */}
      <Link
        to="/cart"
        className={`flex flex-col items-center justify-center w-12 h-full gap-1 relative transition-colors ${
          isActive('/cart') ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <ShoppingBag size={20} />
        <span className="text-[10px] font-bold">Cart</span>
        {cartItemsCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] font-black flex items-center justify-center border border-white">
            {cartItemsCount}
          </span>
        )}
      </Link>

      {/* Profile Tab */}
      <Link
        to="/profile"
        className={`flex flex-col items-center justify-center w-12 h-full gap-1 transition-colors ${
          isActive('/profile') ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <User size={20} />
        <span className="text-[10px] font-bold">Profile</span>
      </Link>
    </div>
  );
}
