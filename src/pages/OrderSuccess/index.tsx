import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  Copy, 
  Phone, 
  MessageSquare, 
  Star, 
  ShoppingCart, 
  RefreshCw, 
  AlertTriangle, 
  Sparkles, 
  MapPin, 
  CreditCard, 
  ChevronRight, 
  Download,
  ShoppingBag,
  ClipboardList,
  CheckCircle,
  Truck,
  Package,
  Lock,
  Building
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';
import type { Order } from '../../types/user';

export default function OrderSuccess() {
  const location = useLocation();
  const { orders } = useAuth();
  const { addToCart } = useCart();

  // Internal states
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [trackingStatus, setTrackingStatus] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(18 * 60); // 18 mins in seconds
  const [partnerContacted, setPartnerContacted] = useState<string | null>(null);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchError, setSearchError] = useState('');

  const trackingSectionRef = useRef<HTMLDivElement>(null);

  const loadingMessages = [
    'Verifying secure payment transaction...',
    'Reserving fresh items from organic stock...',
    'Generating receipt & locating nearby courier...',
    'Order confirmed successfully!'
  ];

  // Fetch active order details from Django API on mount
  useEffect(() => {
    async function fetchActiveOrder() {
      const orderId = location.state?.orderId || (orders.length > 0 ? orders[0].id : null);
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const accessToken = localStorage.getItem('freshcart_access_token');
        const res = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          const adapted: Order = {
            ...data,
            subtotal: Number(data.subtotal),
            shipping: Number(data.shipping),
            discount: Number(data.discount),
            tax: Number(data.tax),
            total: Number(data.total),
            items: (data.items || []).map((item: any) => ({
              ...item,
              price: Number(item.price),
              quantity: Number(item.quantity)
            }))
          };
          setActiveOrder(adapted);

          // Map backend status to trackingStatus index (0 to 4)
          // Steps: 'Pending', 'Confirmed', 'Packed', 'Out', 'Delivered'
          const statusMap: Record<string, number> = {
            'Pending': 0,
            'Processing': 2,
            'Shipped': 3,
            'Delivered': 4,
            'Cancelled': 0
          };
          setTrackingStatus(statusMap[adapted.status] ?? 0);
        } else {
          // Fallback to local context orders list
          const localOrder = orders.find((o) => o.id === orderId);
          if (localOrder) {
            setActiveOrder(localOrder);
          } else {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        setIsLoading(false);
      }
    }

    fetchActiveOrder();
  }, [location.state?.orderId, orders]);

  // Loading animation simulation
  useEffect(() => {
    if (!activeOrder) return;
    
    setIsLoading(true);
    setLoadingStep(0);
    
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 550);
    
    return () => clearInterval(interval);
  }, [activeOrder]);

  // Delivery status countdown timer
  useEffect(() => {
    if (isLoading || !activeOrder || trackingStatus === 4) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTrackingStatus(4);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLoading, activeOrder, trackingStatus]);

  // Handle Loading a Demo Order
  const handleLoadDemoOrder = () => {
    const randomOrderId = 'FC-' + Math.floor(100000 + Math.random() * 900000);
    const demoOrder: Order = {
      id: randomOrderId,
      date: new Date().toISOString(),
      status: 'Pending',
      items: [
        {
          productId: 'f1',
          productName: 'Fresh Red Apples',
          price: 2.99,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60'
        },
        {
          productId: 'v1',
          productName: 'Organic Carrots',
          price: 1.39,
          quantity: 3,
          image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60'
        },
        {
          productId: 'd1',
          productName: 'Organic Whole Milk',
          price: 3.49,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60'
        }
      ],
      subtotal: 13.85,
      shipping: 0.00,
      discount: 2.08,
      tax: 0.94,
      total: 12.71,
      address: {
        id: 'addr-demo',
        fullName: 'Alex Morgan',
        phone: '+1 (555) 492-9102',
        street: '742 Evergreen Terrace',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98105',
        isDefault: true
      },
      paymentMethod: 'Google Pay'
    };
    
    setTrackingStatus(0);
    setTimeRemaining(18 * 60);
    setActiveOrder(demoOrder);
  };

  // Handle Search for real order
  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryId = searchOrderId.trim();
    if (!queryId) return;
    
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem('freshcart_access_token');
      const res = await fetch(`http://127.0.0.1:8000/api/orders/${queryId}/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const adapted: Order = {
          ...data,
          subtotal: Number(data.subtotal),
          shipping: Number(data.shipping),
          discount: Number(data.discount),
          tax: Number(data.tax),
          total: Number(data.total),
          items: (data.items || []).map((item: any) => ({
            ...item,
            price: Number(item.price),
            quantity: Number(item.quantity)
          }))
        };
        setSearchError('');
        setTrackingStatus(0);
        setTimeRemaining(18 * 60);
        setActiveOrder(adapted);
      } else {
        setSearchError(`No order matching "${queryId}" was found in your history.`);
      }
    } catch (err) {
      console.error('Failed to search order:', err);
      setSearchError('Connection to server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync state Order status string for Invoice and tracker
  const getOrderStatusString = (statusVal: number): 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' => {
    if (statusVal === 0) return 'Pending';
    if (statusVal === 1 || statusVal === 2) return 'Processing';
    if (statusVal === 3) return 'Shipped';
    return 'Delivered';
  };

  const currentStatusString = activeOrder ? getOrderStatusString(trackingStatus) : 'Pending';

  // ETA Calculation
  const orderTime = activeOrder ? new Date(activeOrder.date) : new Date();
  const instantETA = new Date(orderTime.getTime() + 18 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Download Invoice Handlers
  const handleDownloadInvoice = () => {
    if (!activeOrder) return;
    const invoiceText = `
==================================================
                 FRESHCART INVOICE
==================================================
Order Reference: ${activeOrder.id}
Date & Time:     ${new Date(activeOrder.date).toLocaleString()}
Status:          ${currentStatusString}
Payment Method:  ${activeOrder.paymentMethod}

DELIVERY ADDRESS:
--------------------------------------------------
Customer:        ${activeOrder.address.fullName}
Address:         ${activeOrder.address.street}
City/State/Zip:  ${activeOrder.address.city}, ${activeOrder.address.state} ${activeOrder.address.zipCode}
Phone:           ${activeOrder.address.phone}

ORDER ITEMS:
--------------------------------------------------
${activeOrder.items
  .map(
    (item, index) =>
      `${index + 1}. ${item.productName.padEnd(25)} x ${item.quantity}  ($${item.price.toFixed(2)} ea) - $${(item.price * item.quantity).toFixed(2)}`
  )
  .join('\n')}

BILL DETAILS:
--------------------------------------------------
Items Subtotal:  $${activeOrder.subtotal.toFixed(2)}
Coupon Discount: -$${activeOrder.discount.toFixed(2)}
Delivery Partner Fee: ${activeOrder.shipping === 0 ? 'FREE' : `$${activeOrder.shipping.toFixed(2)}`}
Taxes & Gov Charges (8%): $${activeOrder.tax.toFixed(2)}
--------------------------------------------------
TOTAL AMOUNT PAID: $${activeOrder.total.toFixed(2)}
==================================================
Thank you for shopping organic with FreshCart!
`;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FreshCart-Invoice-${activeOrder.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy Order ID Function
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Contact Delivery Partner Function
  const handleContactPartner = (type: 'call' | 'chat') => {
    setPartnerContacted(
      type === 'call' 
        ? 'Calling Amit Kumar (+1 555-492-3829)...' 
        : 'Connecting to Amit via secure chat...'
    );
    setTimeout(() => setPartnerContacted(null), 3000);
  };

  // Add Recommended Product to Cart
  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    setCartFeedback(`Added "${product.name}" to your cart!`);
    setTimeout(() => setCartFeedback(null), 3000);
  };

  // Scroll to tracker
  const scrollToTracker = () => {
    trackingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Format Countdown Timer (mm:ss)
  const formatCountdown = (sec: number) => {
    if (sec <= 0) return 'Delivered!';
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Filter 4 recommended products (not in order)
  const recommendedProducts = activeOrder 
    ? products
        .filter(p => !activeOrder.items.some(item => item.productId === p.id))
        .slice(0, 4)
    : products.slice(0, 4);

  // --- 1. SKELETON LOADER STATE ---
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center space-y-6 animate-pulse">
          {/* Animated Spinner Ring */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <Lock className="absolute text-emerald-600 w-6 h-6 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800">Processing Order</h2>
            <p className="text-sm text-slate-500 font-bold min-h-[20px] transition-all duration-300">
              {loadingMessages[loadingStep]}
            </p>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-500 ease-out" 
              style={{ width: `${(loadingStep + 1) * 25}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
            <span>Secure Connection</span>
            <span>Step {loadingStep + 1} of 4</span>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. EMPTY STATE HANDLING ---
  if (!activeOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Checkout', path: '/checkout' }, { label: 'Order Confirmed' }]} />
        
        <div className="max-w-2xl mx-auto mt-10 bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-xl text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 animate-bounce-slow">
            <AlertTriangle size={48} strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl font-black text-slate-900">No Active Order Found</h1>
          <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto leading-relaxed">
            We couldn't detect a recently placed order. If you just checked out, your payment may still be clearing, or your session may have expired.
          </p>

          {/* Track order search */}
          <form onSubmit={handleSearchOrder} className="w-full max-w-md mt-8 flex flex-col sm:flex-row gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <input
              type="text"
              placeholder="Enter your Order ID (e.g. FC-123456)..."
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 text-slate-800 placeholder-slate-400 font-semibold"
            />
            <button
              type="submit"
              className="px-5 h-11 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              <span>Track Order</span>
            </button>
          </form>

          {searchError && (
            <p className="text-rose-500 text-[11px] font-bold mt-2">{searchError}</p>
          )}

          {/* Options */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={handleLoadDemoOrder}
              className="w-full sm:flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-50"
            >
              <Sparkles size={16} />
              <span>View Demo Order</span>
            </button>

            <Link
              to="/products"
              className="w-full sm:flex-1 h-12 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ShoppingBag size={16} />
              <span>Start Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. MAIN ORDER SUCCESS PAGE RENDER ---
  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl">
      {/* Toast Alert Feedback */}
      {cartFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white border border-emerald-800 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-scale-up">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check size={12} strokeWidth={3.5} />
          </div>
          <span className="text-xs font-extrabold">{cartFeedback}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Checkout', path: '/checkout' }, { label: 'Order Confirmed' }]} />

      {/* Main Success Layout Grid */}
      <div className="grid lg:grid-cols-12 gap-8 mt-4">
        
        {/* Left Hand Side: Hero, Tracking, Partner Info (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Success Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl text-center flex flex-col items-center relative overflow-hidden">
            {/* Background organic glow shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-50/50 blur-2xl -translate-y-6 translate-x-6 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-teal-50/50 blur-2xl translate-y-6 -translate-x-6 pointer-events-none"></div>

            {/* Confetti Checkmark icon */}
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-5 relative">
              <div className="absolute inset-0 bg-emerald-50 rounded-full animate-pulse-ring"></div>
              
              {/* Custom SVG Checkmark drawing anim */}
              <svg className="w-12 h-12 relative z-10 text-emerald-600 animate-scale-up" viewBox="0 0 52 52">
                <circle className="animate-checkmark-circle fill-none stroke-emerald-600 stroke-[3.5]" cx="26" cy="26" r="24" />
                <path className="animate-checkmark-draw fill-none stroke-emerald-600 stroke-[3.5] stroke-linecap-round" d="M15 27l7 7 15-15" />
              </svg>
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Transaction Successful
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-3">Order Confirmed!</h1>
            <p className="text-slate-500 text-sm mt-2.5 max-w-md mx-auto leading-relaxed">
              Your payment went through safely. We've received your order and dispatched our delivery courier to hand-pick your groceries.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-8 w-full max-w-lg">
              <button
                onClick={scrollToTracker}
                className="flex-grow h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <ClipboardList size={16} />
                <span>Track Order</span>
              </button>

              <Link
                to="/products"
                className="flex-grow h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-50"
              >
                <ShoppingBag size={16} />
                <span>Continue Shopping</span>
              </Link>

              <button
                onClick={handleDownloadInvoice}
                className="h-12 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 bg-white shadow-sm"
              >
                <Download size={15} />
                <span>Download Invoice</span>
              </button>
            </div>
          </div>

          {/* Delivery Tracking Section */}
          <div ref={trackingSectionRef} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-6 relative">
            
            {/* Interactive Simulation Controls */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                <div>
                  <p className="font-bold text-slate-700">Simulate Order Stepper</p>
                  <p className="text-[10px] text-slate-400">Click steps to test different tracker animations</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {[0, 1, 2, 3, 4].map((step) => {
                  const stepNames = ['Confirmed', 'Packed', 'Shipped', 'Out', 'Delivered'];
                  return (
                    <button
                      key={step}
                      onClick={() => {
                        setTrackingStatus(step);
                        if (step === 4) setTimeRemaining(0);
                        else setTimeRemaining((18 - step * 4) * 60);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-black tracking-wide transition-all active:scale-95 cursor-pointer text-[10px] ${
                        trackingStatus === step
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-white hover:bg-slate-100 border border-slate-100 text-slate-650'
                      }`}
                    >
                      {stepNames[step]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepper Grid Header */}
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div>
                <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                  <Truck size={18} className="text-emerald-600" />
                  <span>Real-time Delivery Tracking</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Partner: FreshCart Logistics Ltd.</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase border border-emerald-100">
                {currentStatusString}
              </span>
            </div>

            {/* Live Progress Stepper */}
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              
              {/* Step 1: Confirmed */}
              <div className={`relative transition-all duration-300 ${trackingStatus >= 0 ? 'opacity-100' : 'opacity-50'}`}>
                {/* Connector Line Fill */}
                {trackingStatus > 0 && (
                  <div className="absolute left-[-21px] top-4 w-[2px] h-12 bg-emerald-600 z-10"></div>
                )}
                {/* Node circle */}
                <div className={`absolute left-[-26px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-20 ${
                  trackingStatus >= 0 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">Order Confirmed</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    We've received your order and payment transaction completed successfully.
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">
                    {orderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Step 2: Packed */}
              <div className={`relative transition-all duration-300 ${trackingStatus >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                {/* Connector Line Fill */}
                {trackingStatus > 1 && (
                  <div className="absolute left-[-21px] top-4 w-[2px] h-12 bg-emerald-600 z-10"></div>
                )}
                {/* Node circle */}
                <div className={`absolute left-[-26px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-20 transition-all ${
                  trackingStatus > 1 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : trackingStatus === 1
                      ? 'bg-white border-emerald-500 text-emerald-600 animate-pulse-ring'
                      : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {trackingStatus > 1 ? <Check size={12} strokeWidth={3} /> : <Package size={12} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">Picked & Packed</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Your organic items are hand-picked, washed, and packed with high sanitization protocols.
                  </p>
                  {trackingStatus >= 1 && (
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">
                      {new Date(orderTime.getTime() + 4 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 3: Shipped */}
              <div className={`relative transition-all duration-300 ${trackingStatus >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                {/* Connector Line Fill */}
                {trackingStatus > 2 && (
                  <div className="absolute left-[-21px] top-4 w-[2px] h-12 bg-emerald-600 z-10"></div>
                )}
                {/* Node circle */}
                <div className={`absolute left-[-26px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-20 transition-all ${
                  trackingStatus > 2 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : trackingStatus === 2
                      ? 'bg-white border-emerald-500 text-emerald-600 animate-pulse-ring'
                      : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {trackingStatus > 2 ? <Check size={12} strokeWidth={3} /> : <Truck size={12} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">Dispatched</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Handed over to our local electric delivery fleet. Moving toward local transit hub.
                  </p>
                  {trackingStatus >= 2 && (
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">
                      {new Date(orderTime.getTime() + 8 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 4: Out for Delivery */}
              <div className={`relative transition-all duration-300 ${trackingStatus >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                {/* Connector Line Fill */}
                {trackingStatus > 3 && (
                  <div className="absolute left-[-21px] top-4 w-[2px] h-12 bg-emerald-600 z-10"></div>
                )}
                {/* Node circle */}
                <div className={`absolute left-[-26px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-20 transition-all ${
                  trackingStatus > 3 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : trackingStatus === 3
                      ? 'bg-white border-emerald-500 text-emerald-600 animate-pulse-ring'
                      : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {trackingStatus > 3 ? <Check size={12} strokeWidth={3} /> : <MapPin size={12} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">Out For Delivery</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Our courier rider Amit Kumar is nearby. Courier is riding a green battery electric scooter.
                  </p>
                  {trackingStatus >= 3 && (
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">
                      {new Date(orderTime.getTime() + 12 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 5: Delivered */}
              <div className={`relative transition-all duration-300 ${trackingStatus >= 4 ? 'opacity-100' : 'opacity-50'}`}>
                {/* Node circle */}
                <div className={`absolute left-[-26px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-20 transition-all ${
                  trackingStatus === 4
                    ? 'bg-emerald-600 border-emerald-600 text-white animate-scale-up'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  <CheckCircle size={12} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">Delivered Fresh</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Order handed over safely at the door. Thank you for choosing organic!
                  </p>
                  {trackingStatus === 4 && (
                    <span className="text-[10px] font-bold text-emerald-650 block mt-1">
                      Delivered successfully
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Courier Partner Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5 mb-4">
              <Building size={16} className="text-emerald-600" />
              <span>Delivery Associate Information</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
              
              {/* Partner Profile */}
              <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                <SafeImage
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
                  alt="Amit Kumar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 p-0.5 bg-white shrink-0"
                  fallbackSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>"
                />
                <div>
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <h4 className="font-black text-slate-800 text-base">Amit Kumar</h4>
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                      Verified Courier
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 justify-center sm:justify-start text-xs mt-1 text-slate-550">
                    <span className="flex items-center gap-1">
                      <Star className="fill-amber-400 text-amber-400 w-3.5 h-3.5" />
                      <strong>4.9 Rating</strong> (1,200+ rides)
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span>Vehicle: <strong>Electric Scooter</strong></span>
                  </div>
                </div>
              </div>

              {/* Action buttons to call/chat */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => handleContactPartner('call')}
                  className="flex-1 sm:flex-initial h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer bg-white"
                >
                  <Phone size={13} />
                  <span>Call Rider</span>
                </button>
                <button
                  onClick={() => handleContactPartner('chat')}
                  className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md shadow-emerald-50"
                >
                  <MessageSquare size={13} />
                  <span>Chat Live</span>
                </button>
              </div>
            </div>

            {/* Display status log for calls/chats */}
            {partnerContacted && (
              <div className="mt-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs font-bold text-emerald-600 animate-scale-up">
                {partnerContacted}
              </div>
            )}
          </div>
        </div>

        {/* Right Hand Side: Estimated Time, Order Details, Product List (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ETA / Countdown Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white border border-emerald-800/10 rounded-3xl p-6 shadow-xl text-center relative overflow-hidden">
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
            
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-900/50 border border-emerald-800/60 px-3 py-1 rounded-full inline-block">
              Estimated Delivery Time
            </span>

            {/* Big Countdown */}
            <div className="mt-5 mb-2">
              <h2 className="text-4xl font-black tracking-tight text-white animate-pulse">
                {trackingStatus === 4 ? 'Delivered!' : formatCountdown(timeRemaining)}
              </h2>
              {trackingStatus !== 4 && (
                <p className="text-emerald-400 text-xs font-bold mt-1.5 flex items-center justify-center gap-1">
                  <span>Arriving by:</span>
                  <span className="underline decoration-dotted decoration-emerald-400 font-extrabold">{instantETA}</span>
                </p>
              )}
            </div>
            
            <p className="text-slate-350 text-[11px] leading-relaxed max-w-xs mx-auto mt-4 pt-3 border-t border-white/10">
              {trackingStatus === 4 
                ? 'Your order was successfully hand-delivered by Amit Kumar.' 
                : 'Our smart routing matches riders to ensure groceries reach you within 20 minutes from checkout.'}
            </p>
          </div>

          {/* Shipment Address & Order Info Breakdown */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <ClipboardList size={16} className="text-emerald-600" />
              <span>Order & Shipping Details</span>
            </h3>

            <div className="space-y-4 text-xs">
              {/* Order ID */}
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Order Reference</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-850">{activeOrder.id}</span>
                  <button 
                    onClick={() => handleCopyId(activeOrder.id)}
                    className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer active:scale-90 transition-all shadow-sm"
                    title="Copy Order ID"
                  >
                    {copied ? <Check size={12} className="text-emerald-655 font-black" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {/* Date */}
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Purchase Date</span>
                <span className="font-bold text-slate-850">{new Date(activeOrder.date).toLocaleDateString()}</span>
              </div>

              {/* Payment Method */}
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment Method</span>
                <span className="font-bold text-slate-850 flex items-center gap-1 text-right">
                  <CreditCard size={13} className="text-slate-400" />
                  <span className="capitalize">{activeOrder.paymentMethod}</span>
                </span>
              </div>

              {/* Shipping Address */}
              <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5">
                <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider">Delivery Address</p>
                  <p className="font-extrabold text-slate-800 mt-1">{activeOrder.address.fullName}</p>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">{activeOrder.address.street}</p>
                  <p className="text-[11px] text-slate-500 leading-normal">{activeOrder.address.city}, {activeOrder.address.state} {activeOrder.address.zipCode}</p>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">Phone: {activeOrder.address.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5 mb-4">
                <Building size={16} className="text-emerald-600" />
                <span>Ordered Items ({activeOrder.items.reduce((sum, item) => sum + item.quantity, 0)})</span>
              </h3>

              {/* Scrollable list */}
              <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-50 pr-1 space-y-1">
                {activeOrder.items.map((item) => (
                  <div key={item.productId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3.5 truncate">
                      <SafeImage
                        src={item.image}
                        alt={item.productName}
                        className="w-10 h-10 object-contain rounded-xl bg-slate-50 border p-1 shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-bold text-slate-800 truncate block">{item.productName}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">
                          Quantity: {item.quantity} x ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total pricing box */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">${activeOrder.subtotal.toFixed(2)}</span>
              </div>
              {activeOrder.discount > 0 && (
                <div className="flex justify-between items-center text-emerald-650 font-bold">
                  <span>Coupon Discount</span>
                  <span>-${activeOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-500">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-800">
                  {activeOrder.shipping === 0 ? 'FREE' : `$${activeOrder.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Estimated Taxes (8%)</span>
                <span className="font-semibold text-slate-800">${activeOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-black text-sm text-slate-900 border-t border-slate-100 pt-3">
                <span>Total Amount Paid</span>
                <span className="text-emerald-600 text-lg">${activeOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Recommended Products Carousel / Grid */}
      <div className="mt-12 pt-8 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-emerald-650 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={14} className="fill-emerald-100 text-emerald-650" />
              <span>Recommended items</span>
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">Frequently Bought Together</h2>
          </div>
          <Link to="/products" className="text-xs font-bold text-emerald-650 hover:text-emerald-700 flex items-center gap-1 group">
            <span>Explore Entire Catalog</span>
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => {
            const hasDiscount = product.discountPrice !== undefined;
            const activePrice = product.discountPrice ?? product.price;

            return (
              <div 
                key={product.id}
                className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
              >
                {/* Discount Badge */}
                {hasDiscount && (
                  <span className="absolute top-3.5 left-3.5 z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500 text-white tracking-wider">
                    -{Math.round(((product.price - product.discountPrice!) / product.price) * 100)}%
                  </span>
                )}

                {/* Product Image Link */}
                <Link to={`/products/${product.id}`} className="block">
                  <div className="w-full h-36 bg-slate-50 rounded-2xl overflow-hidden mb-3 p-1.5 flex items-center justify-center">
                    <SafeImage
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 capitalize">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-slate-800 text-xs mt-0.5 hover:text-emerald-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating & Stock info */}
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-bold text-slate-700">{product.rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{product.unit}</span>
                </div>

                {/* Price and Add button */}
                <div className="mt-3.5 flex items-center justify-between border-t border-slate-50 pt-2.5">
                  <div className="flex flex-col">
                    {hasDiscount && (
                      <span className="text-[10px] text-slate-400 line-through leading-none mb-0.5">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm font-black text-slate-900 leading-none">
                      ${activePrice.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="px-3.5 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all active:scale-95 shadow-md shadow-emerald-50 flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    <ShoppingCart size={11} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
