import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Clock, 
  CreditCard, 
  MapPin, 
  ShoppingBag,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { products } from '../../data/products';
import EmptyOrders from '../../components/ui/EmptyOrders';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';
import type { Order } from '../../types/user';

export default function Orders() {
  const { orders, fetchOrders } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);

  // Fetch orders from backend API on mount
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        await fetchOrders();
      } catch (err) {
        console.error('Failed to load orders history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  // Expanded card state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleCopyOrderId = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Reorder Handler: adds all products in the order back to the cart
  const handleReorder = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    
    let addedCount = 0;
    order.items.forEach((item) => {
      const matchedProduct = products.find((p) => p.id === item.productId);
      if (matchedProduct) {
        addToCart(matchedProduct, item.quantity);
        addedCount += item.quantity;
      }
    });

    if (addedCount > 0) {
      showToast(`Added ${addedCount} items from Order ${order.id} back to cart!`, 'success');
      navigate('/cart');
    } else {
      showToast('Could not find these products in catalog.', 'error');
    }
  };

  // Download invoice helper
  const handleDownloadInvoice = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    
    const invoiceText = `
==================================================
                 FRESHCART INVOICE
==================================================
Order Reference: ${order.id}
Date & Time:     ${new Date(order.date).toLocaleString()}
Status:          ${order.status}
Payment Method:  ${order.paymentMethod}

DELIVERY ADDRESS:
--------------------------------------------------
Customer:        ${order.address.fullName}
Address:         ${order.address.street}
City/State/Zip:  ${order.address.city}, ${order.address.state} ${order.address.zipCode}
Phone:           ${order.address.phone}

ORDER ITEMS:
--------------------------------------------------
${order.items
  .map(
    (item, index) =>
      `${index + 1}. ${item.productName.padEnd(25)} x ${item.quantity}  ($${item.price.toFixed(2)} ea) - $${(item.price * item.quantity).toFixed(2)}`
  )
  .join('\n')}

BILL DETAILS:
--------------------------------------------------
Items Subtotal:  $${order.subtotal.toFixed(2)}
Coupon Discount: -$${order.discount.toFixed(2)}
Delivery Partner Fee: ${order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
Taxes & Gov Charges (8%): $${order.tax.toFixed(2)}
--------------------------------------------------
TOTAL AMOUNT PAID: $${order.total.toFixed(2)}
==================================================
Thank you for shopping organic with FreshCart!
`;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FreshCart-Invoice-${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get status color styling
  const getStatusBadgeStyle = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // Map general status to timeline step numbers
  const getStepNumber = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 5;
      case 'Shipped':
        return 4;
      case 'Processing':
        return 3;
      case 'Pending':
        return 1;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-emerald-600" size={40} />
        <p className="text-slate-500 font-semibold text-sm animate-pulse">Loading orders history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'My Orders' }]} />

      <div className="max-w-4xl mx-auto mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Review your previous organic purchases and track active deliveries</p>
          </div>
          
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-50 hover:shadow-lg transition-all active:scale-95 self-start"
          >
            <ShoppingBag size={14} />
            <span>Shop catalog</span>
          </Link>
        </div>

        {orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const stepNumber = getStepNumber(order.status);

              return (
                <div 
                  key={order.id}
                  className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Card Header (Collapsible trigger) */}
                  <div 
                    onClick={() => toggleOrderExpand(order.id)}
                    className="p-5 md:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/20 transition-colors select-none"
                  >
                    {/* Header meta */}
                    <div className="grid grid-cols-2 md:flex items-center gap-x-6 gap-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Order ID</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-800">{order.id}</span>
                          <button
                            onClick={(e) => handleCopyOrderId(e, order.id)}
                            className="p-1 rounded bg-slate-50 border hover:bg-slate-150 text-slate-400 cursor-pointer active:scale-90 transition-all"
                            title="Copy Order ID"
                          >
                            {copiedOrderId === order.id ? <Check size={11} className="text-emerald-650" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Order Date</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Total Amount</span>
                        <span className="font-black text-emerald-600 text-sm">${order.total.toFixed(2)}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Items</span>
                        <span className="font-bold text-slate-700">{order.items.reduce((sum, item) => sum + item.quantity, 0)} units</span>
                      </div>
                    </div>

                    {/* Right features: Status and toggle */}
                    <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-50">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${getStatusBadgeStyle(order.status)}`}>
                        {order.status}
                      </span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleReorder(e, order)}
                          className="px-3 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all cursor-pointer border border-emerald-150"
                        >
                          Reorder
                        </button>
                        <button
                          onClick={(e) => handleDownloadInvoice(e, order)}
                          className="px-2.5 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-650 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                          title="Download Invoice"
                        >
                          <Download size={13} />
                        </button>
                      </div>
                      
                      <div className="text-slate-400 pl-1">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body content */}
                  {isExpanded && (
                    <div className="border-t border-slate-50 bg-slate-50/20 p-5 md:p-6 space-y-6 animate-scale-up">
                      
                      {/* Timeline status timeline */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-black text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <Clock size={12} className="text-emerald-600 animate-spin-slow" />
                            <span>Track Order Timeline</span>
                          </span>
                          
                          {/* Navigate to Success live tracking panel */}
                          <button
                            onClick={() => navigate('/checkout/success', { state: { orderId: order.id } })}
                            className="text-emerald-650 font-bold hover:underline flex items-center gap-0.5 text-[11px] cursor-pointer"
                          >
                            <span>Live Tracking Screen</span>
                            <ExternalLink size={11} />
                          </button>
                        </div>

                        {/* Horizontal Stepper timeline */}
                        <div className="flex justify-between items-center relative py-4 max-w-xl mx-auto text-[10px]">
                          {/* Connect line back */}
                          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-slate-100 z-10"></div>
                          
                          {/* Fill line progress */}
                          <div 
                            className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-emerald-600 z-15 transition-all duration-500"
                            style={{ width: `${Math.max(0, ((stepNumber - 1) / 4) * 100)}%` }}
                          ></div>

                          {/* Steps nodes */}
                          {['Pending', 'Confirmed', 'Packed', 'Out For Delivery', 'Delivered'].map((step, idx) => {
                            const nodeStep = idx + 1;
                            const isPassed = stepNumber >= nodeStep;
                            const isCurrent = stepNumber === nodeStep;

                            return (
                              <div key={step} className="flex flex-col items-center relative z-25">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 font-bold text-[9px] transition-all ${
                                  isPassed 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-50' 
                                    : isCurrent
                                      ? 'bg-white border-emerald-500 text-emerald-600 animate-pulse-ring'
                                      : 'bg-white border-slate-200 text-slate-400'
                                }`}>
                                  {isPassed ? <Check size={10} strokeWidth={3.5} /> : nodeStep}
                                </div>
                                <span className={`mt-2 font-bold hidden sm:block ${isPassed ? 'text-slate-800' : 'text-slate-400'}`}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items details list */}
                      <div className="grid md:grid-cols-12 gap-6 items-start">
                        {/* Items Column (7 Cols) */}
                        <div className="md:col-span-8 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
                          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-50 pb-2">Purchased Items</h4>
                          
                          <div className="divide-y divide-slate-50">
                            {order.items.map((item) => (
                              <div key={item.productId} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                                <div className="flex items-center gap-3 truncate">
                                  <SafeImage
                                    src={item.image}
                                    alt={item.productName}
                                    className="w-10 h-10 object-contain rounded-lg border bg-slate-50 p-1 shrink-0"
                                  />
                                  <div className="truncate">
                                    <span className="font-bold text-slate-800 block truncate leading-tight">{item.productName}</span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">Quantity: {item.quantity}</span>
                                  </div>
                                </div>
                                <span className="font-bold text-slate-900 shrink-0">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Totals & Addresses Column (4 Cols) */}
                        <div className="md:col-span-4 space-y-4">
                          
                          {/* Sourcing address */}
                          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2.5 text-xs text-slate-650">
                            <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-1">
                              <MapPin size={12} className="text-slate-400" /> Shipping Destination
                            </h4>
                            <p className="font-bold text-slate-800 leading-none">{order.address.fullName}</p>
                            <p className="text-[11px] text-slate-500 leading-normal">{order.address.street}</p>
                            <p className="text-[11px] text-slate-500 leading-none">{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                            <p className="text-[10px] text-slate-400 font-semibold pt-1">Phone: {order.address.phone}</p>
                          </div>

                          {/* Breakdown pricing */}
                          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2.5 text-xs text-slate-550">
                            <h4 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-1">
                              <CreditCard size={12} className="text-slate-400" /> Payment & Billing
                            </h4>
                            <div className="flex justify-between items-center">
                              <span>Subtotal</span>
                              <span className="font-bold text-slate-800">${order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between items-center text-emerald-650 font-bold">
                                <span>Discount</span>
                                <span>-${order.discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span>Delivery Fee</span>
                              <span className="font-bold text-slate-800">
                                {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Taxes (8%)</span>
                              <span className="font-bold text-slate-800">${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center font-black text-slate-900 border-t border-slate-50 pt-2 text-xs">
                              <span>Total Paid</span>
                              <span className="text-emerald-600 text-sm">${order.total.toFixed(2)}</span>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
