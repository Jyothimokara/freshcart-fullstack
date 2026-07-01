import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Star, Truck, ShieldCheck, 
  Clock, ArrowRight, Mail, MapPin, Award, ChevronRight, Zap
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { products } from '../../data/products';
import { categories } from '../../data/categories';
import SafeImage from '../../components/ui/SafeImage';

export default function Home() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Address Selector
  const [addressInput, setAddressInput] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('San Francisco, 94107');
  
  // Deals Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressInput.trim()) {
      setDeliveryAddress(addressInput.trim());
      setAddressInput('');
    }
  };

  const formatTime = (val: number) => String(val).padStart(2, '0');

  // Filter 8 popular products to display (mix of categories)
  const popularProducts = products
    .filter(p => ['f1', 'v1', 'd1', 'b2', 's2', 'sp1', 'f3', 'v3'].includes(p.id))
    .slice(0, 8);

  // Daily deal products (those with discounts)
  const dealProducts = products
    .filter(p => p.discountPrice !== undefined)
    .slice(0, 3);

  // Sample Customer Testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Sarah M.',
      role: 'Verified Customer',
      rating: 5,
      comment: 'The vegetables are always incredibly fresh! Deliveries are super fast, and the packaging is eco-friendly. Highly recommended.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=60'
    },
    {
      id: 2,
      name: 'Michael K.',
      role: 'Home Chef',
      rating: 5,
      comment: 'FreshCart has changed how I meal prep. Finding organic spices and dairy items is a breeze, and the prices are better than local supermarkets.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60'
    },
    {
      id: 3,
      name: 'Elena R.',
      role: 'Busy Parent',
      rating: 5,
      comment: 'Absolutely love the recurring delivery options. The milk and bread arrive on time every week without me having to think about it!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white py-16 lg:py-24">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl translate-y-12 -translate-x-12"></div>
        
        <div className="container mx-auto px-4 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Content Left */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/60 border border-emerald-700/60 rounded-full text-emerald-400 font-semibold text-xs self-start backdrop-blur-md">
              <Zap size={12} className="fill-emerald-400" />
              <span>Free Delivery on orders over $35</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Fresh Organic Groceries <br />
              <span className="text-emerald-400">Delivered To Your Door</span>
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Skip the crowded supermarket lines. Sourced directly from local sustainable farms, we deliver premium organic fruits, vegetables, dairy, and pantry essentials.
            </p>
            
            {/* Delivery address input */}
            <form onSubmit={handleAddressSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl bg-white/10 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 text-white">
                <MapPin size={20} className="text-emerald-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your address for instant delivery..."
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder-slate-400 text-white"
                />
              </div>
              <button
                type="submit"
                className="px-6 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer"
              >
                Set Address
              </button>
            </form>
            
            <div className="flex flex-wrap items-center gap-6 mt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400" />
                <span>Current: <strong className="text-white">{deliveryAddress}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>4.9/5 Rating (50k+ Reviews)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              <Link
                to="/products"
                className="px-6 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <span>Shop Catalog</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/deals"
                className="px-6 h-12 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center"
              >
                View Hot Deals
              </Link>
            </div>
          </div>
          
          {/* Hero Graphics Right */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="w-full aspect-square max-w-[450px] mx-auto relative">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-spin-slow"></div>
              
              {/* Premium Image Container */}
              <div className="absolute inset-4 rounded-[40px] bg-slate-900 border border-emerald-500/30 overflow-hidden shadow-2xl">
                <SafeImage
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
                  alt="Fresh Organic Vegetables Basket"
                  className="w-full h-full object-cover opacity-90 scale-105 hover:scale-100 transition-all duration-700"
                />
              </div>

              {/* Floating Stat Card 1 */}
              <div className="absolute -top-4 -left-6 bg-white text-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 animate-bounce-slow">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Fast Delivery</p>
                  <p className="text-sm font-black leading-none">Under 45 Mins</p>
                </div>
              </div>

              {/* Floating Stat Card 2 */}
              <div className="absolute bottom-10 -right-6 bg-white text-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 animate-bounce-slow" style={{ animationDelay: '1.5s' }}>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 font-black">
                  ★
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Farm Fresh</p>
                  <p className="text-sm font-black leading-none">100% Organic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Explore our catalog</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">Featured Categories</h2>
            </div>
            <Link to="/categories" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
              <span>View All Categories</span>
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-xl hover:border-emerald-100 text-center transition-all duration-300 cursor-pointer"
              >
                {/* Round image frame */}
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-100 group-hover:border-emerald-500/20 transition-all duration-300 bg-white">
                  <SafeImage
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">{cat.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{cat.itemCount} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Popular Products Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Chosen by customers</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">Popular Organic Products</h2>
            </div>
            <Link to="/products" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
              <span>See Full Shop Catalog</span>
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => {
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

                      {/* Wishlist Button */}
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

                      {/* Product Details Link */}
                      <Link to={`/products/${product.id}`} className="block">
                        <div className="w-full h-44 bg-slate-50 rounded-2xl overflow-hidden mb-4 p-2 flex items-center justify-center">
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
        </div>
      </section>

      {/* 4. Daily Deals Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-rose-50 blur-3xl -translate-y-1/2 -translate-x-12 pointer-events-none"></div>

        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-rose-950 via-rose-900 to-amber-950 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-rose-800/20">
            {/* Background texture grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40"></div>
            
            <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Column: Heading and Countdown */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <span className="px-3 py-1 bg-amber-500 text-rose-950 font-black text-[10px] tracking-wider uppercase rounded-full self-start">
                  Limited Time Offers
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Save Big With Our <br />
                  <span className="text-amber-400">Fresh Daily Deals!</span>
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                  Super discounts on top grocery staples. Stock runs out fast, buy before the counter hits zero!
                </p>
                
                {/* Timer Display */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl border border-white/10">
                      {formatTime(timeLeft.hours)}
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold mt-1 uppercase">Hours</span>
                  </div>
                  <span className="text-xl font-bold mb-5">:</span>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl border border-white/10">
                      {formatTime(timeLeft.minutes)}
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold mt-1 uppercase">Mins</span>
                  </div>
                  <span className="text-xl font-bold mb-5">:</span>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl text-amber-400 border border-white/10">
                      {formatTime(timeLeft.seconds)}
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold mt-1 uppercase">Secs</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Highlighted discounted product cards */}
              <div className="lg:col-span-7 grid sm:grid-cols-3 gap-4">
                {dealProducts.map((p) => {
                  const savedPercent = Math.round(((p.price - p.discountPrice!) / p.price) * 100);
                  return (
                    <div key={p.id} className="bg-white text-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between group">
                      <div className="relative">
                        <span className="absolute -top-1.5 -left-1.5 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-10">
                          -{savedPercent}%
                        </span>
                        
                        <Link to={`/products/${p.id}`} className="block">
                          <div className="w-full h-24 bg-slate-50 rounded-xl overflow-hidden mb-3 p-1 flex items-center justify-center">
                            <SafeImage
                              src={p.image}
                              alt={p.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <h3 className="font-bold text-slate-800 text-xs truncate leading-tight hover:text-emerald-650 transition-colors">{p.name}</h3>
                          <p className="text-[10px] text-slate-400 capitalize mt-0.5">{p.category}</p>
                        </Link>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-50 flex items-end justify-between gap-1">
                        <div>
                          <span className="text-[10px] text-slate-400 line-through leading-none block">${p.price.toFixed(2)}</span>
                          <span className="text-sm font-black text-rose-600 leading-none block">${p.discountPrice?.toFixed(2)}</span>
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
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                          aria-label="Add"
                        >
                          <ShoppingBag size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Choose FreshCart */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Premium Experience</span>
          <h2 className="text-3xl font-black text-slate-900 mt-1 mb-12">Why Choose FreshCart</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Truck size={28} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Super Fast Delivery</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Groceries at your doorstep in under 45 minutes. Same-day delivery with real-time route tracking.
              </p>
            </div>
            
            <div className="flex flex-col items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-5">
                <Award size={28} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">100% Fresh & Organic</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Hand-picked fruits, vegetables, and pantry items directly sourced from local USDA organic certified farms.
              </p>
            </div>
            
            <div className="flex flex-col items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Secure Transactions</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                End-to-end encrypted secure checkout. We accept credit cards, digital wallets, and cash on delivery.
              </p>
            </div>
            
            <div className="flex flex-col items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-5">
                <Clock size={28} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Best Prices & Offers</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Direct farm sourcing cuts middlemen costs. We pass down maximum savings to you with daily deal reductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Our Community</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed italic mb-6">"{t.comment}"</p>
                </div>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <SafeImage
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    fallbackSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">{t.name}</h4>
                    <span className="text-xs text-slate-400">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Mobile App Promotion Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-850 to-teal-900 text-white rounded-3xl p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
            
            <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Text Promotion */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <span className="px-3 py-1 bg-emerald-850 text-emerald-400 font-extrabold text-[10px] tracking-wider uppercase rounded-full self-start border border-emerald-750">
                  FreshCart Pocket App
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Shop Fresh Grocery Items <br />
                  <span className="text-emerald-400">On The Go!</span>
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                  Order organic vegetables, tracking your package live, or instantly re-ordering items using the FreshCart Mobile App. Download now for extra checkout vouchers!
                </p>
                
                <div className="flex flex-wrap gap-4 mt-2">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="h-12 px-5 bg-black hover:bg-slate-900 text-white rounded-xl flex items-center gap-3 transition-colors border border-slate-800"
                  >
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 22C14.32 22.05 13.89 21.24 12.37 21.24C10.84 21.24 10.37 21.97 9.1 22.03C7.79 22.08 6.8 20.73 5.96 19.5C4.26 17 2.96 12.44 4.7 9.42C5.56 7.92 7.1 6.97 8.77 6.94C10 6.92 11.19 7.78 11.97 7.78C12.75 7.78 14.15 6.76 15.65 6.91C16.28 6.94 18.06 7.17 19.23 8.88C19.13 8.94 16.92 10.23 16.94 12.87C16.96 15.97 19.61 17.01 19.64 17.02C19.62 17.08 19.21 18.46 18.71 19.5M15.97 4.17C16.63 3.37 17.07 2.28 16.95 1C15.98 1.04 14.81 1.65 14.11 2.47C13.5 3.17 12.97 4.28 13.12 5.54C14.2 5.62 15.3 4.98 15.97 4.17Z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-[9px] text-slate-400 font-bold uppercase leading-none mb-0.5">Download on the</p>
                      <p className="text-sm font-black leading-none">App Store</p>
                    </div>
                  </a>
                  
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="h-12 px-5 bg-black hover:bg-slate-900 text-white rounded-xl flex items-center gap-3 transition-colors border border-slate-800"
                  >
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                      <path d="M5 3.14l11.66 11.66L5 22.8c-.46.46-1.2.46-1.66 0-.46-.46-.46-1.2 0-1.66L11.68 12 3.34 3.66c-.46-.46-.46-1.2 0-1.66.46-.46 1.2-.46 1.66 0z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-[9px] text-slate-400 font-bold uppercase leading-none mb-0.5">Get it on</p>
                      <p className="text-sm font-black leading-none">Google Play</p>
                    </div>
                  </a>
                </div>
              </div>
              
              {/* App Image mockup */}
              <div className="lg:col-span-5 hidden lg:flex justify-center relative">
                <div className="w-56 h-[340px] rounded-[32px] bg-slate-950 border-4 border-slate-800 p-2 shadow-2xl overflow-hidden flex flex-col justify-between">
                  <div className="w-full bg-slate-900 rounded-[24px] overflow-hidden flex-1 relative flex flex-col">
                    <div className="h-5 bg-slate-850 flex justify-center items-center">
                      <div className="w-12 h-2.5 bg-black rounded-full"></div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg mb-3 shadow-md">
                        F
                      </div>
                      <p className="text-xs font-bold text-white mb-1">FreshCart Express</p>
                      <p className="text-[8px] text-emerald-400 font-semibold mb-3">Live Order Tracking</p>
                      <div className="w-full bg-emerald-600/10 border border-emerald-500/20 rounded-lg p-2 flex items-center gap-2">
                        <MapPin size={10} className="text-emerald-400" />
                        <div className="text-left">
                          <p className="text-[7px] text-slate-400 leading-none">Courier is near</p>
                          <p className="text-[8px] text-white font-bold leading-none mt-0.5">Market Street 100</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 8. Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8 text-center flex flex-col items-center gap-5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Subscribe to our newsletter</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-md">
                Get weekly updates on hot deals, new organic items, recipes, and seasonal farmer discount vouchers.
              </p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-white focus:bg-white text-slate-950 placeholder-slate-400 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
