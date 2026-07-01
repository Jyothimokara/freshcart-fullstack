import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, Heart, Plus, Minus, ArrowRight, 
  Percent, ShieldCheck, HelpCircle, Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useDemo } from '../../context/DemoContext';
import { useToast } from '../../context/ToastContext';
import { products } from '../../data/products';
import EmptyCart from '../../components/ui/EmptyCart';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, applyCoupon, removeCoupon, addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { latency } = useDemo();
  const { showToast } = useToast();

  // Loading skeleton state
  const [isLoading, setIsLoading] = useState(true);

  // Coupon input state
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Handle loading skeleton simulator
  useEffect(() => {
    const delay = latency > 0 ? latency : 500;
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, [latency]);

  // Sync coupon messages if context coupon changes (e.g. cleared)
  useEffect(() => {
    if (!cart.appliedCoupon) {
      setCouponSuccess('');
      setCouponCode('');
    } else {
      setCouponSuccess(`Coupon ${cart.appliedCoupon} is active (15% Off)!`);
      setCouponCode(cart.appliedCoupon);
    }
  }, [cart.appliedCoupon]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const success = await applyCoupon(couponCode);
    if (success) {
      setCouponError('');
      setCouponSuccess(`Coupon ${couponCode.toUpperCase()} applied successfully!`);
      showToast(`Coupon ${couponCode.toUpperCase()} applied! (15% Off)`, 'success');
    } else {
      setCouponSuccess('');
      setCouponError('Invalid coupon. Try using "FRESH15"');
      showToast('Invalid coupon code.', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
    showToast('Coupon discount removed.', 'info');
  };

  // Recommended Products: 4 items that are NOT currently in the cart
  const recommendedProducts = useMemo(() => {
    const cartIds = cart.items.map((item) => item.product.id);
    return products
      .filter((p) => !cartIds.includes(p.id))
      .slice(0, 4);
  }, [cart.items]);

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Shopping Cart' }]} />
        
        <div className="grid lg:grid-cols-12 gap-8 mt-6">
          {/* Items Skeleton */}
          <div className="lg:col-span-8 space-y-4">
            <div className="h-12 bg-slate-200 rounded-2xl w-1/4 mb-6"></div>
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 flex gap-4 items-center">
                <div className="w-20 h-20 bg-slate-200 rounded-2xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
                <div className="w-20 h-8 bg-slate-200 rounded-full"></div>
                <div className="w-16 h-4 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Summary Skeleton */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
              <div className="h-12 bg-slate-200 rounded-xl w-full pt-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty Cart State
  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Shopping Cart' }]} />
        
        <EmptyCart />

        {/* Recommended items underneath empty state */}
        <section className="mt-16 border-t border-slate-100 pt-12">
          <div className="mb-8">
            <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Before you go</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Recommended Products</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((p) => {
              const inWish = isInWishlist(p.id);
              const activePrice = p.discountPrice ?? p.price;
              return (
                <div key={p.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative animate-scale-up">
                  <button
                    onClick={() => {
                      toggleWishlist(p.id);
                      showToast(
                        inWish 
                          ? `Removed "${p.name}" from wishlist.` 
                          : `Added "${p.name}" to wishlist!`,
                        inWish ? 'info' : 'success'
                      );
                    }}
                    className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-50 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-50 ${
                      inWish ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart size={16} className={inWish ? 'fill-current' : ''} />
                  </button>

                  <Link to={`/products/${p.id}`} className="block">
                    <div className="w-full h-36 bg-slate-50 rounded-2xl overflow-hidden mb-3 p-1 flex items-center justify-center">
                      <SafeImage src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-455 tracking-wider">{p.category}</span>
                    <h3 className="font-bold text-slate-800 text-xs mt-0.5 truncate group-hover:text-emerald-600 transition-colors">{p.name}</h3>
                  </Link>

                  <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2">
                    <span className="text-sm font-black text-slate-900">${activePrice.toFixed(2)}</span>
                    <button
                      onClick={() => {
                        addToCart(p, 1);
                        showToast(`Added "${p.name}" to cart!`, 'success');
                      }}
                      className="px-3 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // 3. Regular Cart UI
  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Shopping Cart' }]} />

      <h1 className="text-3xl font-black text-slate-900 mt-6 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* === LEFT COLUMN: ITEMS LIST === */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-700">Grocery Items ({cart.items.reduce((sum, item) => sum + item.quantity, 0)})</span>
              <span className="text-xs text-slate-400 font-semibold">Prices include all local taxes</span>
            </div>

            {/* Items */}
            <div className="divide-y divide-slate-100">
              {cart.items.map((item) => {
                const activePrice = item.product.discountPrice ?? item.product.price;
                const hasDiscount = item.product.discountPrice !== undefined;
                const itemSubtotal = activePrice * item.quantity;
                const inWish = isInWishlist(item.product.id);

                return (
                  <div key={item.product.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50/30 transition-colors">
                    
                    {/* Image */}
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden p-1 shrink-0 flex items-center justify-center">
                      <SafeImage
                        src={item.product.image}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Meta details */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{item.product.category}</span>
                      <h3 className="font-extrabold text-slate-800 text-sm leading-tight hover:text-emerald-600 transition-colors">
                        <Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
                      </h3>
                      {item.product.unit && (
                        <p className="text-xs text-slate-400 mt-0.5">{item.product.unit}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="font-bold text-slate-900">${activePrice.toFixed(2)}</span>
                        {hasDiscount && (
                          <span className="text-slate-400 line-through font-normal">${item.product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions and totals */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0 shrink-0">
                      
                      {/* Quantity Modifier Pill */}
                      <div className="flex items-center border border-emerald-250 bg-emerald-50 rounded-xl overflow-hidden h-9 shadow-sm shadow-emerald-50">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-3 h-full text-emerald-700 font-black hover:bg-emerald-100 transition-colors cursor-pointer"
                          aria-label="Decrease Quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 font-black text-xs text-emerald-800 w-6 text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-3 h-full text-emerald-700 font-black hover:bg-emerald-100 transition-colors cursor-pointer"
                          aria-label="Increase Quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Item Total & Remove button */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 font-semibold block leading-none mb-0.5">Subtotal</span>
                          <span className="text-sm font-black text-slate-900 leading-none">${itemSubtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3">
                          <button
                            onClick={() => {
                              toggleWishlist(item.product.id);
                              showToast(
                                inWish 
                                  ? `Removed "${item.product.name}" from wishlist.` 
                                  : `Added "${item.product.name}" to wishlist!`,
                                inWish ? 'info' : 'success'
                              );
                            }}
                            className={`p-1.5 rounded-lg hover:bg-slate-150 transition-colors cursor-pointer ${
                              inWish ? 'text-rose-500' : 'text-slate-400 hover:text-rose-550'
                            }`}
                            title={inWish ? "In Wishlist" : "Move to Wishlist"}
                          >
                            <Heart size={15} className={inWish ? 'fill-current' : ''} />
                          </button>
                          <button
                            onClick={() => {
                              removeFromCart(item.product.id);
                              showToast(`Removed "${item.product.name}" from your cart.`, 'info');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
            
          </div>
        </div>

        {/* === RIGHT COLUMN: STICKY BILL SUMMARY CARD === */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          {/* Coupon Code Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
              <Percent size={18} className="text-emerald-600" />
              <span>Apply Coupon Discount</span>
            </h3>

            {cart.appliedCoupon ? (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-800 block">Coupon Active!</span>
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">{cart.appliedCoupon} (15% Off)</span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. FRESH15)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 bg-white focus:bg-white text-xs font-bold placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-50"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Error or Success warnings */}
            {couponError && (
              <p className="text-[10px] text-rose-500 font-bold mt-2">{couponError}</p>
            )}
            {couponSuccess && !cart.appliedCoupon && (
              <p className="text-[10px] text-emerald-600 font-bold mt-2">{couponSuccess}</p>
            )}

            <div className="mt-3.5 flex items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500 leading-normal">
              <Sparkles size={14} className="text-amber-500 shrink-0" />
              <span>Use promo code <strong className="text-slate-700">FRESH15</strong> to save 15% on your total subtotal instantly!</span>
            </div>
          </div>

          {/* Bill Details Summary Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3 mb-4">Bill Details</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Items Subtotal</span>
                <span className="text-slate-800 font-bold">${cart.subtotal.toFixed(2)}</span>
              </div>

              {cart.discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Percent size={12} /> Coupon Discount
                  </span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  Delivery Partner Fee 
                  <span title="Delivery charges dynamically waived over $35">
                    <HelpCircle size={12} className="text-slate-350 cursor-pointer" />
                  </span>
                </span>
                {cart.shipping === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Free</span>
                ) : (
                  <span className="text-slate-800 font-bold">${cart.shipping.toFixed(2)}</span>
                )}
              </div>

              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Taxes & Gov Charges (8%)</span>
                <span className="text-slate-800 font-bold">${cart.tax.toFixed(2)}</span>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              <div className="flex justify-between items-center text-sm font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-lg text-emerald-600">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="w-full mt-6 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all active:scale-95 shadow-md shadow-emerald-100 hover:shadow-lg flex items-center justify-center gap-1.5 group cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Safety Indicator */}
            <div className="mt-4 flex items-center gap-2 justify-center text-[10px] text-slate-400 font-bold uppercase">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Safe and Secure Checkout</span>
            </div>
          </div>

        </div>

      </div>

      {/* === RECOMMENDED PRODUCTS SECTION === */}
      <section className="mt-16 border-t border-slate-100 pt-12">
        <div className="mb-8">
          <span className="text-emerald-600 font-extrabold text-sm uppercase tracking-wider">Frequently bought together</span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Recommended Products</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((p) => {
            const inWish = isInWishlist(p.id);
            const activePrice = p.discountPrice ?? p.price;
            return (
              <div key={p.id} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative">
                
                {/* Wishlist toggle */}
                <button
                  onClick={() => {
                    toggleWishlist(p.id);
                    showToast(
                      inWish 
                        ? `Removed "${p.name}" from wishlist.` 
                        : `Added "${p.name}" to wishlist!`,
                      inWish ? 'info' : 'success'
                    );
                  }}
                  className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-50 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-50 ${
                    inWish ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Heart size={16} className={inWish ? 'fill-current' : ''} />
                </button>

                {/* Product Meta Link */}
                <Link to={`/products/${p.id}`} className="block">
                  <div className="w-full h-36 bg-slate-50 rounded-2xl overflow-hidden mb-3 p-1 flex items-center justify-center">
                    <SafeImage src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-455 tracking-wider">{p.category}</span>
                  <h3 className="font-bold text-slate-800 text-xs mt-0.5 truncate group-hover:text-emerald-600 transition-colors">{p.name}</h3>
                </Link>

                {/* Pricing & Add CTA */}
                <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2">
                  <span className="text-sm font-black text-slate-900">${activePrice.toFixed(2)}</span>
                  <button
                    onClick={() => {
                      addToCart(p, 1);
                      showToast(`Added "${p.name}" to cart!`, 'success');
                    }}
                    className="px-3 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
