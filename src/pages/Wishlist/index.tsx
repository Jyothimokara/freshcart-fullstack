import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Star, Trash2, Heart, RefreshCw
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProducts } from '../../services/api';
import type { Product } from '../../types/product';
import EmptyWishlist from '../../components/ui/EmptyWishlist';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';

export default function Wishlist() {
  const { addToCart } = useCart();
  const { wishlistIds, toggleWishlist, clearWishlist, loading: wishlistLoading } = useWishlist();

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products from backend
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await getProducts();
        setProductsList(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load products for wishlist:', err);
        setError('Failed to load products from database.');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Map product IDs to actual product objects from API
  const wishlistProducts = useMemo(() => {
    return productsList.filter((p) => wishlistIds.includes(p.id));
  }, [productsList, wishlistIds]);

  if (loading || wishlistLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-emerald-600" size={40} />
        <p className="text-slate-500 font-semibold text-sm animate-pulse">Loading saved items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'My Wishlist' }]} />
        <p className="text-red-500 font-bold mt-10">{error}</p>
      </div>
    );
  }

  if (wishlistIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'My Wishlist' }]} />
        <EmptyWishlist />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'My Wishlist' }]} />

      {/* Page Header */}
      <div className="mt-6 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Saved Items</span>
          <h1 className="text-4xl font-black text-slate-900 mt-1">My Wishlist</h1>
          <p className="text-slate-500 text-xs mt-1.5 font-semibold">
            You have saved <span className="text-emerald-600 font-bold">{wishlistProducts.length}</span> organic grocery items
          </p>
        </div>
        <button
          onClick={clearWishlist}
          className="px-4 h-10 border border-slate-200 hover:border-red-200 hover:bg-rose-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Trash2 size={14} />
          <span>Clear Wishlist</span>
        </button>
      </div>

      {/* Wishlist Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => {
          const hasDiscount = product.discountPrice !== undefined;
          const activePrice = product.discountPrice ?? product.price;

          return (
            <div 
              key={product.id}
              className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative animate-fade-in"
            >
              {/* Remove from Wishlist icon */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-50 flex items-center justify-center text-rose-500 hover:text-rose-600 cursor-pointer transition-all active:scale-90"
                aria-label="Remove from Wishlist"
              >
                <Heart size={18} className="fill-rose-500" />
              </button>

              {/* Discount Tag */}
              {hasDiscount && (
                <span className="absolute top-4 left-4 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white tracking-wider">
                  Save
                </span>
              )}

              {/* Product link details wrapper */}
              <Link to={`/products/${product.id}`} className="block">
                <div className="w-full h-40 bg-slate-50 rounded-2xl overflow-hidden mb-4 p-2 flex items-center justify-center">
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 capitalize">
                  {product.category}
                </span>
                <h3 className="font-bold text-slate-800 text-sm mt-1 hover:text-emerald-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>

              {/* Rating and Stock */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                </span>
              </div>

              {/* Price and Action Buttons */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 gap-2">
                <div className="flex flex-col">
                  {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through leading-none mb-0.5">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                  <span className="text-base font-black text-slate-900 leading-none">
                    ${activePrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCart(product, 1)}
                    disabled={product.stock === 0}
                    className="px-4 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all active:scale-95 shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
