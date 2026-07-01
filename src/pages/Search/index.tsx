import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Star, SlidersHorizontal, 
  ChevronLeft, ChevronRight, X, RefreshCw, Search as SearchIcon
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { products } from '../../data/products';
import NoResults from '../../components/ui/NoResults';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import ProductSkeleton from '../../components/ui/ProductSkeleton';
import SafeImage from '../../components/ui/SafeImage';

const ITEMS_PER_PAGE = 8;

export default function Search() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract search query
  const query = searchParams.get('q') || '';

  // Local state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Trigger search loading state when query changes
  useEffect(() => {
    if (query) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [query]);

  // Reset pagination and filters on query change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedCategories([]);
    setPriceRange('all');
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('relevance');
  }, [query]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, priceRange, minRating, inStockOnly, sortBy]);

  // Filter products by query first
  const searchedProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Calculate dynamic category counts based on searched products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    searchedProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [searchedProducts]);

  // Filter and sort searched products
  const filteredProducts = useMemo(() => {
    let result = [...searchedProducts];

    // 1. Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category.toLowerCase()));
    }

    // 2. Price Range Filter
    if (priceRange !== 'all') {
      result = result.filter((p) => {
        const activePrice = p.discountPrice ?? p.price;
        if (priceRange === 'under-2') return activePrice < 2;
        if (priceRange === '2-to-5') return activePrice >= 2 && activePrice <= 5;
        if (priceRange === '5-to-10') return activePrice >= 5 && activePrice <= 10;
        if (priceRange === 'over-10') return activePrice > 10;
        return true;
      });
    }

    // 3. Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // 4. Availability Filter
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // 5. Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'relevance') {
      // Keep search index order (relevance)
    }

    return result;
  }, [searchedProducts, selectedCategories, priceRange, minRating, inStockOnly, sortBy]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  // Paginated list
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange('all');
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('relevance');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    selectedCategories.length > 0 || 
    priceRange !== 'all' || 
    minRating > 0 || 
    inStockOnly;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Search Results' }]} />

      {/* Empty Search Query State */}
      {!query.trim() ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm max-w-xl mx-auto mt-6">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
            <SearchIcon size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Search for Groceries</h2>
          <p className="text-slate-400 font-semibold text-xs mt-2 max-w-sm">
            Enter a product name, brand, or category in the search bar above to begin exploring.
          </p>
          <div className="mt-8 w-full max-w-xs space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Popular Searches</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Apples', 'Bananas', 'Milk', 'Carrots', 'Orange Juice'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchParams({ q: term })}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          {/* Search Header Info */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">
                FreshCart Search
              </span>
              <h1 className="text-2xl font-black text-slate-900 leading-none">
                Results for "<span className="text-emerald-650">{query}</span>"
              </h1>
              <p className="text-xs text-slate-400 font-bold mt-1.5">
                Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} matching your filters
              </p>
            </div>

            {/* Sort & Mobile filter trigger */}
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold hidden md:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 px-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* === FILTERS SIDEBAR (DESKTOP) === */}
            <aside className="hidden lg:block w-64 shrink-0 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm self-start space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <SlidersHorizontal size={16} className="text-emerald-600" />
                  <span>Filters</span>
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-0.5 cursor-pointer"
                  >
                    <RefreshCw size={10} /> Clear
                  </button>
                )}
              </div>

              {/* Category checkbox list */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                  Category
                </h4>
                {Object.keys(categoryCounts).length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-semibold italic">No categories matching</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(categoryCounts).map(([catSlug, count]) => (
                      <label key={catSlug} className="flex items-center justify-between text-xs font-semibold text-slate-600 cursor-pointer select-none">
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(catSlug.toLowerCase())}
                            onChange={() => handleCategoryToggle(catSlug.toLowerCase())}
                            className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
                          />
                          <span className="capitalize">{catSlug}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                          {count}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price range selector */}
              <div className="border-t border-slate-50 pt-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                  Price
                </h4>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  {[
                    { label: 'All prices', value: 'all' },
                    { label: 'Under $2', value: 'under-2' },
                    { label: '$2 to $5', value: '2-to-5' },
                    { label: '$5 to $10', value: '5-to-10' },
                    { label: 'Over $10', value: 'over-10' }
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="priceRange"
                        value={opt.value}
                        checked={priceRange === opt.value}
                        onChange={() => setPriceRange(opt.value)}
                        className="text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating selector */}
              <div className="border-t border-slate-50 pt-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                  Rating
                </h4>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  {[
                    { label: 'All ratings', value: 0 },
                    { label: '4★ & Above', value: 4 },
                    { label: '3★ & Above', value: 3 }
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="ratingFilter"
                        checked={minRating === opt.value}
                        onChange={() => setMinRating(opt.value)}
                        className="text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="border-t border-slate-50 pt-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                  Availability
                </h4>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </aside>

            {/* === MAIN RESULTS PANEL === */}
            <div className="flex-1 w-full space-y-6">
              {isLoading ? (
                // Skeleton Grid state
                <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                // Empty state handled by standard NoResults
                <NoResults query={query} onClearFilters={clearFilters} />
              ) : (
                <>
                  {/* Active filter tags row */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider shrink-0 mr-1">
                        Active filters:
                      </span>
                      
                      {selectedCategories.map((cat) => (
                        <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                          <span>{cat}</span>
                          <button onClick={() => handleCategoryToggle(cat)} className="hover:text-emerald-950 cursor-pointer">
                            <X size={12} />
                          </button>
                        </span>
                      ))}

                      {priceRange !== 'all' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span>
                            {priceRange === 'under-2' && 'Under $2'}
                            {priceRange === '2-to-5' && '$2 - $5'}
                            {priceRange === '5-to-10' && '$5 - $10'}
                            {priceRange === 'over-10' && 'Over $10'}
                          </span>
                          <button onClick={() => setPriceRange('all')} className="hover:text-emerald-950 cursor-pointer">
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

                      {inStockOnly && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span>In Stock</span>
                          <button onClick={() => setInStockOnly(false)} className="hover:text-emerald-950 cursor-pointer">
                            <X size={12} />
                          </button>
                        </span>
                      )}

                      <button
                        onClick={clearFilters}
                        className="text-xs font-semibold text-red-500 hover:text-red-650 hover:underline cursor-pointer ml-1"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  {/* Results Grid */}
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

                          {/* Product Details Wrapper */}
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
                                className="h-8.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center transition-all active:scale-95 text-center bg-white shadow-sm"
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

                  {/* Pagination */}
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
        </div>
      )}

      {/* === MOBILE FILTERS DRAWER/OVERLAY === */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
          {/* Backdrop */}
          <div 
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          ></div>
          
          {/* Drawer content */}
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between animate-slide-in-right">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-800 text-base flex items-center gap-1.5">
                  <SlidersHorizontal size={18} className="text-emerald-600" />
                  <span>Filters</span>
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Category */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                  Category
                </h4>
                {Object.keys(categoryCounts).length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-semibold italic">No categories matching</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(categoryCounts).map(([catSlug, count]) => (
                      <label key={catSlug} className="flex items-center justify-between text-xs font-semibold text-slate-600 cursor-pointer select-none">
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(catSlug.toLowerCase())}
                            onChange={() => handleCategoryToggle(catSlug.toLowerCase())}
                            className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
                          />
                          <span className="capitalize">{catSlug}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                          {count}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-slate-50 pt-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                  Price
                </h4>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  {[
                    { label: 'All prices', value: 'all' },
                    { label: 'Under $2', value: 'under-2' },
                    { label: '$2 to $5', value: '2-to-5' },
                    { label: '$5 to $10', value: '5-to-10' },
                    { label: 'Over $10', value: 'over-10' }
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="mobilePriceRange"
                        value={opt.value}
                        checked={priceRange === opt.value}
                        onChange={() => setPriceRange(opt.value)}
                        className="text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="border-t border-slate-50 pt-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                  Rating
                </h4>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  {[
                    { label: 'All ratings', value: 0 },
                    { label: '4★ & Above', value: 4 },
                    { label: '3★ & Above', value: 3 }
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="mobileRatingFilter"
                        checked={minRating === opt.value}
                        onChange={() => setMinRating(opt.value)}
                        className="text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="border-t border-slate-50 pt-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                  Availability
                </h4>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-4 mt-6">
              <button
                onClick={clearFilters}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-slate-50 cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-md shadow-emerald-50"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
