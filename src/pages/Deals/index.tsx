import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Heart, Star, Clock, Percent, Flame
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { products } from '../../data/products';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';

export default function Deals() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Simulated countdown timers (General Flash Sale)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 22 });

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

  const formatTime = (val: number) => String(val).padStart(2, '0');

  // Filter only discounted products
  const discountedProducts = useMemo(() => {
    return products.filter((p) => p.discountPrice !== undefined);
  }, []);

  // Stock simulated calculations (based on product ID to remain stable across renders)
  const getSimulatedStockDetails = (id: string, stock: number) => {
    const numericId = parseInt(id.replace(/\D/g, '') || '5', 10);
    const sold = (numericId * 7) % Math.max(stock, 10);
    const total = stock + sold;
    const percentage = Math.round((sold / total) * 100);
    return { sold, total, percentage };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Deals & Offers' }]} />

      {/* === FLASH SALE BANNER === */}
      <section className="bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12 mt-6 border border-rose-500/20">
        {/* Abstract background graphics */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl translate-y-12 translate-x-12 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-4 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-rose-950 font-black text-[10px] tracking-wider uppercase rounded-full self-center lg:self-start">
              <Flame size={12} className="fill-current" />
              <span>Super Flash Sale</span>
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Huge Discounts <br />
              <span className="text-amber-300">On Fresh Stock!</span>
            </h1>
            <p className="text-rose-100 text-sm md:text-base max-w-md">
              Grab premium organic grocery staples at unbeatable prices. Coupons and automatic basket discounts apply!
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex flex-col items-center bg-black/25 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl">
            <p className="text-xs text-rose-200 font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1">
              <Clock size={12} /> Ends In:
            </p>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl border border-white/10">
                  {formatTime(timeLeft.hours)}
                </div>
                <span className="text-[9px] text-rose-100 font-semibold mt-1 uppercase">Hours</span>
              </div>
              <span className="text-xl font-bold mb-4">:</span>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl border border-white/10">
                  {formatTime(timeLeft.minutes)}
                </div>
                <span className="text-[9px] text-rose-100 font-semibold mt-1 uppercase">Mins</span>
              </div>
              <span className="text-xl font-bold mb-4">:</span>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl text-amber-300 border border-white/10">
                  {formatTime(timeLeft.seconds)}
                </div>
                <span className="text-[9px] text-rose-100 font-semibold mt-1 uppercase">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === DEALS FILTER HEADING === */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Limited Inventory</span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Available Hot Deals</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
          <Percent size={16} className="text-emerald-600" />
          <span>No promo code required!</span>
        </div>
      </div>

      {/* === DEALS GRID === */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {discountedProducts.map((product) => {
          const inWishlist = isInWishlist(product.id);
          const activePrice = product.discountPrice ?? product.price;
          const savedPercent = Math.round(((product.price - activePrice) / product.price) * 100);
          
          // Simulated stock progression
          const stockDetails = getSimulatedStockDetails(product.id, product.stock);

          return (
            <div 
              key={product.id}
                className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all duration-300 flex flex-col justify-between group relative animate-scale-up"
              >
                {/* Discount Percentage Badge */}
                <span className="absolute top-4 left-4 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white tracking-wider flex items-center gap-0.5">
                  <Percent size={10} /> Save {savedPercent}%
                </span>

                {/* Wishlist Hearts Toggle */}
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

                {/* Product link details wrapper */}
                <Link to={`/products/${product.id}`} className="block">
                  <div className="w-full h-40 bg-slate-50 rounded-2xl overflow-hidden mb-4 p-2 flex items-center justify-center">
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  </div>
                  
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-455 capitalize">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1 hover:text-emerald-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating Star */}
                <div className="mt-2 flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 text-amber-600 text-xs font-bold self-start">
                  <Star size={11} className="fill-current" />
                  <span>{product.rating} ★</span>
                </div>

                {/* Stock progress indicator (Premium Element) */}
                <div className="mt-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                    <span>Sold: {stockDetails.sold}</span>
                    <span className="text-rose-600 font-extrabold">Only {product.stock} left!</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                      style={{ width: `${stockDetails.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Pricing & Add to Cart button */}
                <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-50 pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-rose-605 leading-none">
                      ${activePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-450 line-through font-semibold">
                      ${product.price.toFixed(2)}
                    </span>
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
  );
}
