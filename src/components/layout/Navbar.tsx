import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, ChevronDown, LogOut, Package, MapPin, X, Menu } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { products } from '../../data/products';
import type { Product } from '../../types/product';
import SafeImage from '../ui/SafeImage';

export default function Navbar() {
  const { cart } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const suggestionRef = useRef<HTMLDivElement>(null);
  const mobileSuggestionRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for premium floating navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dropdown close listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) &&
        (mobileSuggestionRef.current && !mobileSuggestionRef.current.contains(event.target as Node))
      ) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Autocomplete
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const filtered = products
        .filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5); // Max 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsDrawerOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    setSearchQuery('');
    setShowSuggestions(false);
    setIsDrawerOpen(false);
    navigate(`/products/${productId}`);
  };

  const cartItemsCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100 py-2'
          : 'bg-white border-b border-slate-200 py-3'
      }`}
    >
      {/* Top Main Row */}
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        {/* Brand Logo & Mobile Hamburger Menu button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-slate-50 cursor-pointer lg:hidden focus:outline-none transition-colors"
            aria-label="Open Menu"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-100">
              F
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Fresh<span className="text-emerald-600">Cart</span>
            </span>
          </Link>
        </div>

        {/* Location Selector (Premium Detail) - Desktop only */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
          <MapPin size={16} className="text-emerald-600" />
          <div>
            <p className="font-semibold text-slate-700 leading-none mb-0.5">Deliver to</p>
            <p className="font-normal text-slate-500 leading-none">San Francisco, 94107</p>
          </div>
        </div>

        {/* Search Bar Container - Desktop only */}
        <div className="hidden lg:block flex-1 max-w-md xl:max-w-xl relative" ref={suggestionRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search fresh fruits, vegetables, dairy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
              <div className="py-2 border-b border-slate-50 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Products Suggestions
              </div>
              <div className="divide-y divide-slate-50">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.id)}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <SafeImage
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-100 p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{product.category}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-950">
                      ${(product.discountPrice ?? product.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div
                onClick={handleSearchSubmit}
                className="bg-slate-50 hover:bg-slate-100/80 p-3 text-center text-xs font-semibold text-emerald-600 border-t border-slate-100 cursor-pointer"
              >
                View all matching results
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links - Tablet & Desktop */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-semibold text-slate-600">
          <Link
            to="/"
            className={`transition-colors hover:text-emerald-600 ${
              location.pathname === '/' ? 'text-emerald-600' : ''
            }`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`transition-colors hover:text-emerald-600 ${
              location.pathname === '/products' ? 'text-emerald-600' : ''
            }`}
          >
            Shop Catalog
          </Link>
          <Link
            to="/categories"
            className={`transition-colors hover:text-emerald-600 ${
              location.pathname === '/categories' ? 'text-emerald-600' : ''
            }`}
          >
            Categories
          </Link>
          <Link
            to="/deals"
            className={`transition-colors hover:text-emerald-600 ${
              location.pathname === '/deals' ? 'text-emerald-600' : ''
            }`}
          >
            Deals
          </Link>
          <Link
            to="/about"
            className={`transition-colors hover:text-emerald-600 ${
              location.pathname === '/about' ? 'text-emerald-600' : ''
            }`}
          >
            About
          </Link>
        </nav>

        {/* User Actions - Always inline */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-rose-500 relative transition-all border border-transparent hover:border-slate-100"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse">
                {wishlistIds.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-emerald-600 relative transition-all border border-transparent hover:border-slate-100"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={profileRef}>
            {user ? (
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1 hover:bg-slate-50 p-1.5 rounded-xl border border-transparent hover:border-slate-100 transition-all cursor-pointer focus:outline-none"
              >
                <SafeImage
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  fallbackSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>"
                />
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 sm:px-4 h-10 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 font-semibold text-sm transition-all"
              >
                <User size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Profile Dropdown Box */}
            {isProfileOpen && user && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-50">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User size={16} className="text-slate-400" />
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Package size={16} className="text-slate-400" />
                    My Orders
                  </Link>
                </div>
                <div className="border-t border-slate-50 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                      showToast('Logged out successfully', 'success');
                      navigate('/', { replace: true });
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-rose-50 transition-colors text-left cursor-pointer focus:outline-none"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Search Bar Row - Visible on viewport <lg */}
      <div className="lg:hidden container mx-auto px-4 pb-1 pt-2 border-t border-slate-100 mt-2 relative" ref={mobileSuggestionRef}>
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            placeholder="Search fresh fruits, vegetables, dairy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Mobile Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
            <div className="py-2 border-b border-slate-50 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Products Suggestions
            </div>
            <div className="divide-y divide-slate-50">
              {suggestions.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.id)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-100 p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{product.category}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-950">
                    ${(product.discountPrice ?? product.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div
              onClick={handleSearchSubmit}
              className="bg-slate-50 hover:bg-slate-100/80 p-3 text-center text-xs font-semibold text-emerald-600 border-t border-slate-100 cursor-pointer"
            >
              View all matching results
            </div>
          </div>
        )}
      </div>

      {/* Sliding Mobile Navigation Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative flex flex-col w-72 max-w-sm bg-white h-full shadow-2xl z-10 animate-slide-in transition-transform duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                  F
                </div>
                <span className="text-lg font-black text-slate-900">
                  Fresh<span className="text-emerald-600">Cart</span>
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 cursor-pointer focus:outline-none transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
              {/* Profile Block inside Drawer */}
              {user ? (
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <SafeImage
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                    fallbackSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-semibold">Welcome,</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-sm shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-colors"
                >
                  <User size={16} />
                  <span>Sign In / Register</span>
                </Link>
              )}

              {/* Navigation Links */}
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Departments</p>
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Shop Catalog', path: '/products' },
                  { name: 'Categories', path: '/categories' },
                  { name: 'Deals & Offers', path: '/deals' },
                  { name: 'About Us', path: '/about' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      location.pathname === item.path
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Account Quick Links */}
              {user && (
                <div className="flex flex-col gap-1 border-t border-slate-100 pt-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">My Account</p>
                  <Link
                    to="/profile"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <User size={18} className="text-slate-400" />
                    Personal Details
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Package size={18} className="text-slate-400" />
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Heart size={18} className="text-slate-400" />
                    My Wishlist
                  </Link>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            {user && (
              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    logout();
                    setIsDrawerOpen(false);
                    showToast('Logged out successfully', 'success');
                    navigate('/', { replace: true });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100/80 transition-colors cursor-pointer focus:outline-none"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
