import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Star, Search, SlidersHorizontal, 
  ChevronLeft, ChevronRight, X, RefreshCw
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import NoResults from '../../components/ui/NoResults';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';

import { getProducts, getCategories } from '../../services/api';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';

const ITEMS_PER_PAGE = 8;

export default function Products() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read search & category parameters from URL
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  // API states
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Local filter states
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(20);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Fetch products and categories on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProductsList(fetchedProducts);
        setCategoriesList(fetchedCategories);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching catalog data:', err);
        setError('Unable to load catalog from Django REST API. Verify the server is active.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync state with URL search query changes (e.g. from Navbar search)
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  // Sync state with URL category parameter changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setCurrentPage(1); // Reset page on category change
  }, [categoryParam]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...productsList];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Price Filter
    result = result.filter((p) => {
      const activePrice = p.discountPrice ?? p.price;
      return activePrice >= minPrice && activePrice <= maxPrice;
    });

    // 4. Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // 5. Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [searchQuery, selectedCategory, minPrice, maxPrice, minRating, sortBy]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  // Reset page if filters change to prevent empty index
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, minRating, sortBy]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMinPrice(0);
    setMaxPrice(20);
    setMinRating(0);
    setSortBy('popular');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Helper to calculate total count of items per category
  const getCategoryCount = (slug: string) => {
    return productsList.filter(p => p.category === slug).length;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="animate-spin text-emerald-600" size={40} />
        <p className="text-slate-500 font-semibold">Loading fresh catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100 max-w-md text-center">
          <h3 className="font-bold text-lg mb-2">Connection Error</h3>
          <p className="text-sm font-semibold">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Shop Catalog' }]} />

      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        
        {/* === FILTERS SIDEBAR (DESKTOP) === */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm self-start">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              <SlidersHorizontal size={18} className="text-emerald-600" />
              <span>Filters</span>
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-0.5 cursor-pointer"
            >
              <RefreshCw size={10} /> Clear All
            </button>
          </div>

          {/* Search Query Filter */}
          <div className="mb-6">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">Search Keywords</h4>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type keywords..."
                className="w-full h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">Categories</h4>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setSelectedCategory('all'); setSearchParams({}); }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                  selectedCategory === 'all' || !selectedCategory
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>All Categories</span>
                <span className="text-[10px] bg-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded-full">{productsList.length}</span>
              </button>
              {categoriesList.map((cat) => {
                const count = getCategoryCount(cat.slug);
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                      selectedCategory === cat.slug
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="capitalize">{cat.name}</span>
                    <span className="text-[10px] bg-slate-200/50 text-slate-500 px-1.5 py-0.5 rounded-full">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">Max Price Limit</h4>
            <div className="flex flex-col gap-2">
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold mt-1">
                <span>$0.00</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">${maxPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">Customer Rating</h4>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setMinRating(0)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                  minRating === 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>Any Rating</span>
              </button>
              {[4.5, 4.0, 3.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setMinRating(rate)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                    minRating === rate
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star size={12} className="fill-current" />
                  </div>
                  <span>{rate}★ & Above</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* === MAIN PRODUCTS CATALOG AREA === */}
        <div className="flex-1 flex flex-col">
          
          {/* Top Bar (Results count, Sort options, Mobile toggle) */}
          <div className="flex flex-wrap items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 gap-4 mb-6 shadow-sm">
            <div className="text-xs text-slate-500 font-semibold">
              Showing <span className="text-slate-900 font-bold">{Math.min(filteredProducts.length, ITEMS_PER_PAGE * currentPage)}</span> of <span className="text-slate-900 font-bold">{filteredProducts.length}</span> organic items
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mobile Filters Toggle Button */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-1 px-3.5 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
              >
                <SlidersHorizontal size={14} />
                <span>Filter</span>
              </button>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filter badges */}
          {(selectedCategory && selectedCategory !== 'all' || minRating > 0 || maxPrice < 25) && (
            <div className="flex flex-wrap gap-2 items-center mb-6">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">Active:</span>
              
              {selectedCategory && selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="capitalize">{selectedCategory}</span>
                  <button onClick={() => { setSelectedCategory('all'); setSearchParams({}); }} className="hover:text-emerald-950 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              {maxPrice < 25 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span>Max ${maxPrice}</span>
                  <button onClick={() => setMaxPrice(25)} className="hover:text-emerald-950 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span>{minRating}★ & Above</span>
                  <button onClick={() => setMinRating(0)} className="hover:text-emerald-950 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid or NoResults */}
          {filteredProducts.length === 0 ? (
            <NoResults query={searchQuery} onClearFilters={clearFilters} />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => {
                  const inWishlist = isInWishlist(product.id);
                  const hasDiscount = product.discountPrice !== undefined;
                  const activePrice = product.discountPrice ?? product.price;

                  return (
                    <div 
                      key={product.id}
                      className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative animate-scale-up"
                    >
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <span className="absolute top-4 left-4 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white tracking-wider">
                          -{Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% Off
                        </span>
                      )}

                      {/* Wishlist Heart Toggle */}
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            showToast('Please login to continue', 'info');
                            navigate('/login', { state: { from: location } });
                            return;
                          }
                          toggleWishlist(product.id);
                          showToast(
                            inWishlist 
                              ? `Removed "${product.name}" from wishlist.` 
                              : `Added "${product.name}" to wishlist!`,
                            inWishlist ? 'info' : 'success'
                          );
                        }}
                        className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:bg-slate-50 ${
                          inWishlist ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                        }`}
                        aria-label="Toggle Wishlist"
                      >
                        <Heart size={18} className={inWishlist ? 'fill-current' : ''} />
                      </button>

                      {/* Product details wrapper */}
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

                      {/* Rating & Stock */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 text-amber-600 text-xs font-bold">
                          <Star size={11} className="fill-current" />
                          <span>{product.rating} ★</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                        </span>
                      </div>

                      {/* Pricing and Action row */}
                      <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-50 pt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-slate-900 leading-none">
                            ${activePrice.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-450 line-through font-semibold">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-bold ml-auto">{product.unit}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Link
                            to={`/products/${product.id}`}
                            className="h-8.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center transition-all active:scale-95 text-center"
                          >
                            View Details
                          </Link>
                          
                          <button
                            onClick={() => {
                              if (!isAuthenticated) {
                                showToast('Please login to continue', 'info');
                                navigate('/login', { state: { from: location } });
                                return;
                              }
                              addToCart(product, 1);
                              showToast(`Added "${product.name}" to cart!`, 'success');
                            }}
                            disabled={product.stock === 0}
                            className="h-8.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-md shadow-emerald-50 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                          >
                            <ShoppingBag size={12} />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* === MOBILE FILTERS SLIDE OVER / MODAL DRAWER === */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Overlay */}
            <div
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            ></div>

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
                    <SlidersHorizontal size={20} className="text-emerald-600" />
                    <span>Search Filters</span>
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Filter content inside scrollable view */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                  {/* Search Query Filter */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">Search Keywords</h4>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type keywords..."
                        className="w-full h-11 pl-10 pr-8 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">Categories</h4>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => { setSelectedCategory('all'); setSearchParams({}); }}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                          selectedCategory === 'all' || !selectedCategory
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-slate-600'
                        }`}
                      >
                        <span>All Categories</span>
                        <span className="text-xs bg-slate-150 px-2 py-0.5 rounded-full">{productsList.length}</span>
                      </button>
                      {categoriesList.map((cat) => {
                        const count = getCategoryCount(cat.slug);
                        return (
                          <button
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); }}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                              selectedCategory === cat.slug
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-slate-600'
                            }`}
                          >
                            <span className="capitalize">{cat.name}</span>
                            <span className="text-xs bg-slate-150 px-2 py-0.5 rounded-full">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Slider */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">Max Price Limit</h4>
                    <div className="flex flex-col gap-2">
                      <input
                        type="range"
                        min="1"
                        max="25"
                        step="0.5"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="flex justify-between items-center text-xs text-slate-500 font-bold mt-1">
                        <span>$0.00</span>
                        <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">${maxPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">Customer Rating</h4>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => setMinRating(0)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                          minRating === 0 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        <span>Any Rating</span>
                      </button>
                      {[4.5, 4.0, 3.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setMinRating(rate)}
                          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                            minRating === rate ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-0.5 text-amber-400">
                            <Star size={14} className="fill-current" />
                          </div>
                          <span>{rate}★ & Above</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer and apply button */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                  <button
                    onClick={() => { clearFilters(); setShowMobileFilters(false); }}
                    className="flex-1 h-11 border border-slate-200 bg-white text-slate-700 rounded-xl font-bold text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 h-11 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
