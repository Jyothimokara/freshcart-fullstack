import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  ChevronRight, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  Award, 
  ArrowLeft,
  AlertCircle,
  Sparkles,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';

import { getProductById, getProducts } from '../../services/api';
import type { Product } from '../../types/product';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  // API states
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Set the primary image in gallery state
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (!id) return;
    async function loadProductData() {
      try {
        setLoading(true);
        const [fetchedProduct, fetchedAllProducts] = await Promise.all([
          getProductById(id as string),
          getProducts()
        ]);
        setProduct(fetchedProduct);
        setAllProducts(fetchedAllProducts);
        setSelectedImage(fetchedProduct.image || '');
        setQuantity(1);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching product data:', err);
        setError('Product details failed to load from Django backend.');
      } finally {
        setLoading(false);
      }
    }
    loadProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="animate-spin text-emerald-600" size={40} />
        <p className="text-slate-500 font-semibold">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-slate-500 bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-md text-center flex flex-col items-center gap-3">
          <AlertCircle className="text-red-500" size={40} />
          <h3 className="font-bold text-slate-800 text-lg">Product Not Found</h3>
          <p className="text-xs text-slate-500 font-semibold">{error || 'This product does not exist or has been removed.'}</p>
        </div>
        <Link
          to="/products"
          className="px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice !== undefined;
  const inWishlist = isInWishlist(product.id);

  // Generate dynamic gallery thumbnails using Unsplash theme photos
  const productGallery = [
    product.image,
    'https://images.unsplash.com/photo-1610348725531-843dff163e2c?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1506484381205-f7945653044d?w=500&auto=format&fit=crop&q=60'
  ];

  // Simulated Customer Reviews list
  const customerReviews = [
    {
      id: 1,
      name: 'Robert C.',
      rating: 5,
      date: 'June 18, 2026',
      comment: 'Super fresh and delicious! Sourced organic. Packed perfectly in an eco-friendly bag. Highly recommend this for morning salads.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60'
    },
    {
      id: 2,
      name: 'Emily S.',
      rating: 4,
      date: 'June 14, 2026',
      comment: 'Good size and very sweet. A bit pricey but definitely worth the premium quality.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=60'
    },
    {
      id: 3,
      name: 'Marcus L.',
      rating: 5,
      date: 'May 29, 2026',
      comment: 'Exceptional texture and smell. Sourced directly from local organic farms as advertised. Delivered in under 30 minutes!',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=60'
    }
  ];

  // Filter 4 related products from the same category
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showToast('Please login to continue', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }
    addToCart(product, quantity);
    showToast(`Added ${quantity} ${product.unit} of "${product.name}" to cart!`, 'success');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      showToast('Please login to continue', 'info');
      navigate('/login', {
        state: {
          from: {
            pathname: '/checkout',
            state: {
              buyNowItem: {
                product,
                quantity
              }
            }
          }
        }
      });
      return;
    }
    navigate('/checkout', {
      state: {
        buyNowItem: {
          product,
          quantity
        }
      }
    });
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      showToast('Please login to continue', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }
    toggleWishlist(product.id);
    if (!inWishlist) {
      showToast(`Added "${product.name}" to your wishlist!`, 'success');
    } else {
      showToast(`Removed "${product.name}" from your wishlist.`, 'info');
    }
  };

  const incrementQty = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  const decrementQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Shop Catalog', path: '/products' },
          { label: product.category, path: `/products?category=${product.category}` },
          { label: product.name }
        ]} 
      />

      {/* Main product detail container card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-xl mt-4">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* === LEFT COLUMN: Image Gallery (5 Cols) === */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Primary Main Image Frame */}
            <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden p-6 flex items-center justify-center relative">
              <SafeImage
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-all duration-300 transform hover:scale-105"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white tracking-wider">
                  -{Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% Off
                </span>
              )}
            </div>

            {/* Gallery Thumbnails List */}
            <div className="grid grid-cols-4 gap-3">
              {productGallery.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  onMouseEnter={() => setSelectedImage(imgUrl)}
                  className={`aspect-square bg-slate-50 border rounded-xl overflow-hidden p-1 flex items-center justify-center cursor-pointer transition-all ${
                    selectedImage === imgUrl 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'border-slate-150 hover:border-slate-300'
                  }`}
                >
                  <SafeImage src={imgUrl} alt={`${product.name} gallery ${index}`} className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* === RIGHT COLUMN: Product Information (7 Cols) === */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Category tag */}
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 self-start">
                Organic {product.category}
              </span>

              {/* Title & Rating */}
              <h1 className="text-3xl font-black text-slate-900 mt-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100 text-amber-600 text-xs font-black">
                  <Star size={12} className="fill-current" />
                  <span>{product.rating} ★</span>
                </div>
                <span className="text-slate-400 text-xs font-semibold">
                  (50+ Customer Reviews)
                </span>
                <span className="text-slate-300">|</span>
                <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 flex items-baseline gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-black text-rose-600">
                      ${product.discountPrice?.toFixed(2)}
                    </span>
                    <span className="text-base text-slate-450 line-through font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-black text-rose-500 uppercase tracking-wide bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md ml-1.5">
                      Save ${(product.price - product.discountPrice!).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-slate-900">
                    ${product.price.toFixed(2)}
                  </span>
                )}
                <span className="text-slate-400 text-xs font-semibold ml-auto">
                  Per Unit: {product.unit}
                </span>
              </div>

              {/* Interactive Purchase Row */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  {/* Quantity Incrementor */}
                  <div className="flex items-center border border-slate-200 rounded-xl h-12 bg-white overflow-hidden shadow-sm shrink-0">
                    <button
                      onClick={decrementQty}
                      className="w-11 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={15} strokeWidth={2.5} />
                    </button>
                    <span className="w-12 text-center text-sm font-black text-slate-800 select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQty}
                      className="w-11 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={15} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Wishlist Icon Button (Mobile only) */}
                  <button
                    onClick={handleToggleWishlist}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm sm:hidden ${
                      inWishlist 
                        ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'
                    }`}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart size={20} className={inWishlist ? 'fill-current' : ''} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-grow">
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-50 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    <ShoppingBag size={16} />
                    <span>Add To Cart</span>
                  </button>

                  {/* Buy Now Button */}
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    <CreditCard size={16} />
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* Wishlist Icon Button (Tablet/Desktop only) */}
                <button
                  onClick={handleToggleWishlist}
                  className={`hidden sm:flex w-12 h-12 rounded-xl border items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm shrink-0 ${
                    inWishlist 
                      ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100' 
                      : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-slate-300'
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart size={20} className={inWishlist ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Tab Selector (Description vs Reviews) */}
              <div className="mt-8 border-b border-slate-100 flex gap-6 text-sm font-bold">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'description'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Reviews ({customerReviews.length})
                </button>
              </div>

              {/* Tab Contents */}
              <div className="mt-5 text-sm text-slate-600 leading-relaxed min-h-[120px]">
                {activeTab === 'description' ? (
                  <div className="space-y-4">
                    <p>{product.description}</p>
                    <p>
                      Each organic delivery is carefully inspected to meet USDA quality regulations. FreshCart sources raw fresh items directly from certified sustainable family farms, maintaining absolute trace origin lists.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {customerReviews.map((review) => (
                      <div key={review.id} className="border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                             <SafeImage 
                              src={review.avatar} 
                              alt={review.name} 
                              className="w-8 h-8 rounded-full object-cover border" 
                              fallbackSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>"
                            />
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs">{review.name}</h4>
                              <div className="flex gap-0.5 text-amber-400 mt-0.5">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} size={11} className="fill-current" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{review.date}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 pl-11 leading-normal italic">
                          "{review.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Farm Fresh Guarantee Icons */}
            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Award size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">100% Organic</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Truck size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">Express Delivery</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-2">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">Safe Storage</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={14} className="fill-emerald-100" />
                <span>Similiar products</span>
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">Related Organic Products</h2>
            </div>
            <Link to={`/products?category=${product.category}`} className="text-xs font-bold text-emerald-650 hover:text-emerald-700 flex items-center gap-1 group">
              <span>View All Category Items</span>
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const itemInWishlist = isInWishlist(p.id);
              const pHasDiscount = p.discountPrice !== undefined;
              const pActivePrice = p.discountPrice ?? p.price;

              return (
                <div 
                  key={p.id}
                  className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative animate-scale-up"
                >
                  {/* Discount Badge */}
                  {pHasDiscount && (
                    <span className="absolute top-3.5 left-3.5 z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500 text-white tracking-wider">
                      -{Math.round(((p.price - p.discountPrice!) / p.price) * 100)}%
                    </span>
                  )}

                  {/* Wishlist toggle */}
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        showToast('Please login to continue', 'info');
                        navigate('/login', { state: { from: location } });
                        return;
                      }
                      toggleWishlist(p.id);
                      showToast(
                        itemInWishlist 
                          ? `Removed "${p.name}" from wishlist.` 
                          : `Added "${p.name}" to wishlist!`,
                        itemInWishlist ? 'info' : 'success'
                      );
                    }}
                    className={`absolute top-3.5 right-3.5 z-10 w-8.5 h-8.5 rounded-full bg-white shadow-md border border-slate-50 flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:bg-slate-50 ${
                      itemInWishlist ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                    }`}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart size={16} className={itemInWishlist ? 'fill-current' : ''} />
                  </button>

                  {/* Product Details Link */}
                  <Link to={`/products/${p.id}`} className="block">
                    <div className="w-full h-36 bg-slate-50 rounded-2xl overflow-hidden mb-3 p-1.5 flex items-center justify-center">
                      <SafeImage
                        src={p.image}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 capitalize">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-slate-800 text-xs mt-0.5 hover:text-emerald-600 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                  </Link>

                  {/* Rating & Stock */}
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-bold text-slate-700">{p.rating}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{p.unit}</span>
                  </div>

                  {/* Pricing and Action row */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-slate-50 pt-2.5">
                    <div className="flex flex-col">
                      {pHasDiscount && (
                        <span className="text-[10px] text-slate-400 line-through leading-none mb-0.5">
                          ${p.price.toFixed(2)}
                        </span>
                      )}
                      <span className="text-sm font-black text-slate-900 leading-none">
                        ${pActivePrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          showToast('Please login to continue', 'info');
                          navigate('/login', { state: { from: location } });
                          return;
                        }
                        addToCart(p, 1);
                        showToast(`Added "${p.name}" to cart!`, 'success');
                      }}
                      disabled={p.stock === 0}
                      className="px-3.5 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all active:scale-95 shadow-md shadow-emerald-50 flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      <ShoppingBag size={11} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}


