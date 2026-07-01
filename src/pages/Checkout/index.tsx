import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, CreditCard, Landmark, Truck, ArrowRight, Wallet, 
  MapPin, Lock, AlertCircle, Percent, Check, Calendar, Clock, 
  ChevronDown, ChevronUp, Trash2, Edit2, Plus
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

type DeliveryMethod = 'standard' | 'express' | 'sameday';
type PaymentMethod = 'credit-card' | 'debit-card' | 'upi' | 'net-banking' | 'wallet' | 'cod';

const BANKS = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citi Bank', 'US Bank', 'Fidelity'];
const WALLETS = ['PayPal', 'Apple Pay', 'Google Pay', 'Venmo'];

export default function Checkout() {
  const { cart, clearCart, applyCoupon, removeCoupon, addToCart } = useCart();
  const { user, addresses, createOrder, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const buyNowItem = location.state?.buyNowItem;

  // Redirect to cart if empty and not a buy now flow
  useEffect(() => {
    if (!buyNowItem && cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items, buyNowItem, navigate]);

  // Loading skeleton state on mount
  const [isPageLoading, setIsPageLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  // Accordion active step state: 1 (Address), 2 (Slot), 3 (Payment), 4 (Review)
  const [activeStep, setActiveStep] = useState<number>(1);

  // --- STEP 1: ADDRESS MANAGEMENT STATE ---
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddress?.id || 'new');
  
  // Sync selectedAddressId with addresses once they load from database
  useEffect(() => {
    if (addresses.length > 0) {
      const exists = addresses.some(a => a.id === selectedAddressId);
      if (!exists || selectedAddressId === 'new') {
        const def = addresses.find(a => a.isDefault) || addresses[0];
        if (def) {
          setSelectedAddressId(def.id);
        }
      }
    } else {
      setSelectedAddressId('new');
    }
  }, [addresses, selectedAddressId]);

  // New / Edit address form toggles & state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [addrName, setAddrName] = useState(user?.name || '');
  const [addrPhone, setAddrPhone] = useState('');

  // --- STEP 2: DELIVERY SLOT STATE ---
  const [deliveryDate, setDeliveryDate] = useState('Today');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('6:00 PM - 9:00 PM');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');

  // --- STEP 3: PAYMENT OPTIONS STATE ---
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);
  const [selectedWallet, setSelectedWallet] = useState(WALLETS[0]);

  // --- SIDEBAR STATE ---
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // --- SUBMISSION / VALIDATION STATES ---
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  // Pre-populate coupon details
  useEffect(() => {
    if (cart.appliedCoupon) {
      setCouponCode(cart.appliedCoupon);
      setCouponSuccess(`Coupon ${cart.appliedCoupon} applied (15% Off)`);
    }
  }, [cart.appliedCoupon]);

  const activeSubtotal = useMemo(() => {
    if (buyNowItem) {
      return (buyNowItem.product.discountPrice ?? buyNowItem.product.price) * buyNowItem.quantity;
    }
    return cart.subtotal;
  }, [cart.subtotal, buyNowItem]);

  const activeDiscount = useMemo(() => {
    if (buyNowItem) {
      if (cart.appliedCoupon) {
        return activeSubtotal * 0.15;
      }
      return 0;
    }
    return cart.discount;
  }, [cart.discount, activeSubtotal, cart.appliedCoupon, buyNowItem]);

  // Estimate delivery shipping fees
  const shippingFee = useMemo(() => {
    if (deliveryMethod === 'standard') {
      return activeSubtotal > 35 ? 0 : 5.99;
    }
    if (deliveryMethod === 'sameday') {
      return 7.99;
    }
    if (deliveryMethod === 'express') {
      return 9.99;
    }
    return 5.99;
  }, [deliveryMethod, activeSubtotal]);

  const activeTax = useMemo(() => {
    if (buyNowItem) {
      return (activeSubtotal - activeDiscount) * 0.08;
    }
    return cart.tax;
  }, [cart.tax, activeSubtotal, activeDiscount, buyNowItem]);

  // Estimate total
  const grandTotal = useMemo(() => {
    return activeSubtotal - activeDiscount + shippingFee + activeTax;
  }, [activeSubtotal, activeDiscount, shippingFee, activeTax]);

  // Handle Coupon Apply
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

  // --- CRUD Address Handlers ---
  const resetAddressForm = () => {
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('United States');
    setAddrName(user?.name || '');
    setAddrPhone('');
    setEditingAddressId(null);
    setIsAddingAddress(false);
  };

  const handleEditAddressInit = (addrId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const addr = addresses.find((a) => a.id === addrId);
    if (addr) {
      setEditingAddressId(addrId);
      setIsAddingAddress(false);
      setAddrName(addr.fullName);
      setAddrPhone(addr.phone);
      
      const parts = addr.street.split(' ');
      setAddressLine1(parts.slice(0, 3).join(' '));
      setAddressLine2(parts.slice(3).join(' '));
      setCity(addr.city);
      setState(addr.state);
      setPostalCode(addr.zipCode);
      setCountry('United States');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!addrName.trim()) errors.addrName = 'Name is required';
    if (!addrPhone.trim() || addrPhone.replace(/\D/g, '').length < 10) errors.addrPhone = 'Please enter a valid 10-digit phone';
    if (!addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!state.trim()) errors.state = 'State is required';
    if (!postalCode.trim() || postalCode.replace(/\D/g, '').length < 5) errors.postalCode = 'Valid zip code is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const addrData = {
      fullName: addrName.trim(),
      phone: addrPhone.trim(),
      street: `${addressLine1} ${addressLine2}`.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: postalCode.trim(),
      isDefault: false
    };

    if (editingAddressId) {
      const success = await updateAddress(editingAddressId, addrData);
      if (success) {
        setSelectedAddressId(editingAddressId);
        showToast('Delivery address updated successfully!', 'success');
      }
    } else {
      const newAddr = await addAddress(addrData);
      if (newAddr) {
        // Select the newly added address using database ID
        setSelectedAddressId(newAddr.id);
        showToast('New delivery address added!', 'success');
      }
    }

    setFormErrors({});
    resetAddressForm();
  };

  // Step Navigations & Val
  const handleAddressStepComplete = () => {
    if (selectedAddressId === 'new' && !isAddingAddress) {
      setGeneralError('Please select a delivery address or click Add New Address.');
      return;
    }
    setGeneralError('');
    setActiveStep(2);
  };

  const handleSlotStepComplete = () => {
    setActiveStep(3);
  };

  const handlePaymentStepComplete = () => {
    const errors: Record<string, string> = {};

    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
      if (!cardNumber.trim() || cardNumber.replace(/\D/g, '').length < 16) {
        errors.cardNumber = 'Valid 16-digit card number is required';
      }
      if (!cardExpiry.trim() || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
        errors.cardExpiry = 'Expiry must be MM/YY';
      }
      if (!cardCvv.trim() || cardCvv.replace(/\D/g, '').length < 3) {
        errors.cardCvv = '3-digit CVV is required';
      }
    }

    if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        errors.upiId = 'UPI ID must contain @ (e.g. user@bank)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setGeneralError('Please fill in valid payment credentials.');
      return;
    }

    setFormErrors({});
    setGeneralError('');
    setActiveStep(4);
  };

  // Finalize checkout submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setIsPlacingOrder(true);

    try {
      const activeAddress = addresses.find((a) => a.id === selectedAddressId) || defaultAddress;
      if (!activeAddress) {
        throw new Error('Please configure a valid delivery address');
      }

      if (buyNowItem) {
        await clearCart();
        await addToCart(buyNowItem.product, buyNowItem.quantity);
      }

      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 1800));

      let displayPayment = '';
      if (paymentMethod === 'cod') displayPayment = 'Cash on Delivery';
      else if (paymentMethod === 'upi') displayPayment = `UPI (${upiId})`;
      else if (paymentMethod === 'net-banking') displayPayment = `Net Banking (${selectedBank})`;
      else if (paymentMethod === 'wallet') displayPayment = `Wallet (${selectedWallet})`;
      else displayPayment = `${paymentMethod === 'credit-card' ? 'Credit' : 'Debit'} Card (ending in ${cardNumber.slice(-4)})`;

      const order = await createOrder(activeAddress, displayPayment);

      // Unconditionally clear the frontend cart (backend already cleared database items)
      await clearCart();

      // Show Toast Notification
      showToast('Order placed successfully!', 'success');

      // Navigate to order confirmation
      navigate('/checkout/success', { state: { orderId: order.id } });

    } catch (err: unknown) {
      setGeneralError('Order placement failed. Check card credentials.');
      console.error(err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Skeletons
  if (isPageLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Checkout' }]} />
        <div className="grid lg:grid-cols-12 gap-8 mt-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-44 bg-slate-200 rounded-3xl"></div>
            <div className="h-64 bg-slate-200 rounded-3xl"></div>
          </div>
          <div className="lg:col-span-4">
            <div className="h-80 bg-slate-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || defaultAddress;

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Shopping Cart', path: '/cart' }, { label: 'Checkout' }]} />

      <h1 className="text-3xl font-black text-slate-900 mt-6 mb-8">Secure Checkout</h1>

      {generalError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* === LEFT COLUMN: ACCORDION STEPS === */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* STEP 1: DELIVERY ADDRESS */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
            {/* Header Accordion */}
            <div 
              onClick={() => setActiveStep(1)}
              className="px-6 py-5 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50/40"
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${
                  activeStep === 1 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  1
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm leading-none">Delivery Address</h3>
                  {activeStep !== 1 && selectedAddress && (
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      Deliver to: {selectedAddress.fullName} - {selectedAddress.street}
                    </p>
                  )}
                </div>
              </div>
              {activeStep === 1 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {/* Step Body */}
            {activeStep === 1 && (
              <div className="p-6 bg-white space-y-6">
                
                {/* Save address list or add/edit forms */}
                {!isAddingAddress && !editingAddressId ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-5 rounded-3xl border text-left cursor-pointer transition-all flex flex-col justify-between relative ${
                            selectedAddressId === addr.id
                              ? 'border-emerald-500 bg-emerald-50/10 shadow-md shadow-emerald-50/20'
                              : 'border-slate-200 hover:border-slate-350 bg-white shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                                <MapPin size={14} className="text-emerald-600" />
                                {addr.fullName}
                              </span>
                              {selectedAddressId === addr.id && (
                                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{addr.street}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{addr.city}, {addr.state} {addr.zipCode}</p>
                            <p className="text-[10px] text-slate-450 font-bold mt-2 uppercase">Phone: {addr.phone}</p>
                          </div>

                          {/* Address Action Bar */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => handleEditAddressInit(addr.id, e)}
                                className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-0.5 cursor-pointer"
                              >
                                <Edit2 size={10} /> Edit
                              </button>
                              <button 
                                onClick={async (e) => { e.stopPropagation(); const success = await deleteAddress(addr.id); if (success) showToast('Address deleted successfully.', 'info'); }}
                                className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-0.5 cursor-pointer"
                              >
                                <Trash2 size={10} /> Delete
                              </button>
                            </div>
                            
                            {!addr.isDefault && (
                              <button 
                                onClick={async (e) => { e.stopPropagation(); await setDefaultAddress(addr.id); }}
                                className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg hover:bg-emerald-100 cursor-pointer"
                              >
                                Set Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add new address card */}
                      <div
                        onClick={() => setIsAddingAddress(true)}
                        className="p-5 rounded-3xl border border-dashed border-slate-200 hover:border-slate-350 bg-slate-50/30 text-center flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px]"
                      >
                        <Plus size={20} className="text-slate-400 mb-1" />
                        <span className="font-bold text-slate-800 text-xs">Add New Address</span>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Deliver to home or office</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <Button onClick={handleAddressStepComplete} className="px-6 h-10 cursor-pointer text-xs">
                        <span>Continue to Delivery Slot</span>
                        <ArrowRight size={14} />
                      </Button>
                    </div>
                  </>
                ) : (
                  // Address Add / Edit Form
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                        {editingAddressId ? 'Edit Sourcing Address' : 'Add New Sourcing Address'}
                      </h4>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Contact Name"
                        placeholder="e.g. Jane Doe"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        error={formErrors.addrName}
                        required
                      />
                      <Input
                        label="Phone Number"
                        placeholder="e.g. 555-123-4567"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        error={formErrors.addrPhone}
                        required
                      />
                      <div className="md:col-span-2">
                        <Input
                          label="Address Line 1"
                          placeholder="Street, suite, floor, P.O. Box"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          error={formErrors.addressLine1}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Address Line 2 (Optional)"
                          placeholder="Apartment, unit, building"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                        />
                      </div>
                      <Input
                        label="City"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        error={formErrors.city}
                        required
                      />
                      <Input
                        label="State / Province"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        error={formErrors.state}
                        required
                      />
                      <Input
                        label="Postal / Zip Code"
                        placeholder="5-digit code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                        error={formErrors.postalCode}
                        required
                      />
                      <Input
                        label="Country"
                        placeholder="United States"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="px-4 h-10 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-emerald-50"
                      >
                        {editingAddressId ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: DELIVERY SLOT */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
            <div 
              onClick={() => activeStep > 1 && setActiveStep(2)}
              className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between ${
                activeStep < 2 ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-slate-50/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${
                  activeStep === 2 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  2
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm leading-none">Delivery Slot & Speed</h3>
                  {activeStep > 2 && (
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      Scheduled: {deliveryDate} | {deliveryTimeSlot} ({deliveryMethod})
                    </p>
                  )}
                </div>
              </div>
              {activeStep === 2 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {activeStep === 2 && (
              <div className="p-6 space-y-6">
                
                {/* Date Selection */}
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Select Date</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Today', 'Tomorrow', 'Day after tomorrow'].map((day) => (
                      <div
                        key={day}
                        onClick={() => setDeliveryDate(day)}
                        className={`p-3.5 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          deliveryDate === day
                            ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800'
                            : 'border-slate-200 hover:border-slate-350 text-slate-600'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Slot Selection */}
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" />
                    <span>Select Time Slot</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['7:00 AM - 10:00 AM', '12:00 PM - 3:00 PM', '6:00 PM - 9:00 PM'].map((slot) => (
                      <div
                        key={slot}
                        onClick={() => setDeliveryTimeSlot(slot)}
                        className={`p-3.5 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          deliveryTimeSlot === slot
                            ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800'
                            : 'border-slate-200 hover:border-slate-350 text-slate-600'
                        }`}
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Speed Selection */}
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Truck size={14} className="text-slate-400" />
                    <span>Delivery Speed & Charge</span>
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    {/* Standard */}
                    <div
                      onClick={() => setDeliveryMethod('standard')}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-[100px] ${
                        deliveryMethod === 'standard'
                          ? 'border-emerald-500 bg-emerald-50/15'
                          : 'border-slate-200 hover:border-slate-350 bg-white'
                      }`}
                    >
                      <span className="font-bold text-slate-800 text-xs">Standard Delivery</span>
                      <div>
                        <span className="text-[9px] text-slate-400 block mt-1">Estim. 1-2 Business Days</span>
                        <span className="text-xs font-black text-emerald-600 mt-1 block">
                          {cart.subtotal > 35 ? 'FREE' : '$5.99'}
                        </span>
                      </div>
                    </div>

                    {/* Same Day */}
                    <div
                      onClick={() => setDeliveryMethod('sameday')}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-[100px] ${
                        deliveryMethod === 'sameday'
                          ? 'border-emerald-500 bg-emerald-50/15'
                          : 'border-slate-200 hover:border-slate-350 bg-white'
                      }`}
                    >
                      <span className="font-bold text-slate-800 text-xs">Same Day Delivery</span>
                      <div>
                        <span className="text-[9px] text-slate-400 block mt-1">Deliver by today evening</span>
                        <span className="text-xs font-black text-slate-900 mt-1 block">$7.99</span>
                      </div>
                    </div>

                    {/* Express */}
                    <div
                      onClick={() => setDeliveryMethod('express')}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between h-[100px] ${
                        deliveryMethod === 'express'
                          ? 'border-emerald-500 bg-emerald-50/15'
                          : 'border-slate-200 hover:border-slate-350 bg-white'
                      }`}
                    >
                      <span className="font-bold text-slate-800 text-xs">Express Delivery</span>
                      <div>
                        <span className="text-[9px] text-slate-400 block mt-1">Delivered in 2 hours</span>
                        <span className="text-xs font-black text-slate-900 mt-1 block">$9.99</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button onClick={handleSlotStepComplete} className="px-6 h-10 cursor-pointer text-xs">
                    <span>Continue to Payment Method</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: PAYMENT METHOD */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
            <div 
              onClick={() => activeStep > 2 && setActiveStep(3)}
              className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between ${
                activeStep < 3 ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-slate-50/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${
                  activeStep === 3 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  3
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm leading-none">Payment Method</h3>
                  {activeStep > 3 && (
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 capitalize">
                      Method: {paymentMethod.replace('-', ' ')}
                    </p>
                  )}
                </div>
              </div>
              {activeStep === 3 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {activeStep === 3 && (
              <div className="p-6 space-y-6">
                
                {/* Method selector tab */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {/* Card */}
                  <div
                    onClick={() => { setPaymentMethod('credit-card'); setFormErrors({}); }}
                    className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'credit-card'
                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-350 bg-white text-slate-650'
                    }`}
                  >
                    <CreditCard size={18} />
                    <span className="font-extrabold text-[10px] leading-tight block">Card</span>
                  </div>

                  {/* UPI */}
                  <div
                    onClick={() => { setPaymentMethod('upi'); setFormErrors({}); }}
                    className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-350 bg-white text-slate-650'
                    }`}
                  >
                    <Landmark size={18} />
                    <span className="font-extrabold text-[10px] leading-tight block">UPI</span>
                  </div>

                  {/* Net Banking */}
                  <div
                    onClick={() => { setPaymentMethod('net-banking'); setFormErrors({}); }}
                    className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'net-banking'
                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-350 bg-white text-slate-650'
                    }`}
                  >
                    <Landmark size={18} />
                    <span className="font-extrabold text-[10px] leading-tight block">Net Bank</span>
                  </div>

                  {/* Wallet */}
                  <div
                    onClick={() => { setPaymentMethod('wallet'); setFormErrors({}); }}
                    className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'wallet'
                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-350 bg-white text-slate-650'
                    }`}
                  >
                    <Wallet size={18} />
                    <span className="font-extrabold text-[10px] leading-tight block">Wallet</span>
                  </div>

                  {/* COD */}
                  <div
                    onClick={() => { setPaymentMethod('cod'); setFormErrors({}); }}
                    className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-350 bg-white text-slate-650'
                    }`}
                  >
                    <ShieldCheck size={18} />
                    <span className="font-extrabold text-[10px] leading-tight block">COD</span>
                  </div>
                </div>

                {/* Payments Form Fields */}
                {(paymentMethod === 'credit-card' || paymentMethod === 'debit-card') && (
                  <div className="grid md:grid-cols-3 gap-4 border-t border-slate-100 pt-5 space-y-0">
                    <div className="md:col-span-3">
                      <Input
                        label="Card Number"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        error={formErrors.cardNumber}
                        required
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="Expiry Date"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
                          setCardExpiry(value.slice(0, 5));
                        }}
                        error={formErrors.cardExpiry}
                        required
                      />
                    </div>

                    <div>
                      <Input
                        label="CVV / CVC"
                        type="password"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        error={formErrors.cardCvv}
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="border-t border-slate-100 pt-5">
                    <Input
                      label="UPI Address"
                      placeholder="e.g. username@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      error={formErrors.upiId}
                      required
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Authorize collection request from your BHIM/GPay/PhonePe wallet app.</p>
                  </div>
                )}

                {paymentMethod === 'net-banking' && (
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <label className="text-xs font-semibold text-slate-700 block">Select Net Banking Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full h-11 px-3.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-750 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-slate-400">Redirects securely to your chosen bank login module.</p>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <label className="text-xs font-semibold text-slate-700 block">Select Active Wallet</label>
                    <select
                      value={selectedWallet}
                      onChange={(e) => setSelectedWallet(e.target.value)}
                      className="w-full h-11 px-3.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-750 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {WALLETS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-slate-400">Will open a pop-up redirecting to authorize transaction.</p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-650 leading-normal flex items-start gap-2 border-t mt-5">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Receive delivery and pay by scanning QR code or paying hard cash directly to our delivery courier.</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button onClick={handlePaymentStepComplete} className="px-6 h-10 cursor-pointer text-xs">
                    <span>Continue to Order Review</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: ORDER REVIEW */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
            <div 
              onClick={() => activeStep > 3 && setActiveStep(4)}
              className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between ${
                activeStep < 4 ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-slate-50/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${
                  activeStep === 4 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  4
                </span>
                <h3 className="font-extrabold text-slate-800 text-sm leading-none">Order Review</h3>
              </div>
              {activeStep === 4 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {activeStep === 4 && (
              <div className="p-6 bg-white space-y-6">
                
                {/* Summary choices overview */}
                <div className="grid md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100/50 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Delivery To</h5>
                    <p className="font-extrabold text-slate-800 mt-1">{selectedAddress?.fullName}</p>
                    <p className="text-slate-500 mt-0.5 leading-relaxed truncate">{selectedAddress?.street}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Delivery Time</h5>
                    <p className="font-extrabold text-slate-800 mt-1">{deliveryDate}</p>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">{deliveryTimeSlot}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Payment Using</h5>
                    <p className="font-extrabold text-slate-800 mt-1 capitalize">{paymentMethod.replace('-', ' ')}</p>
                    <p className="text-slate-500 mt-0.5 leading-relaxed truncate">
                      {paymentMethod === 'upi' ? upiId : paymentMethod === 'net-banking' ? selectedBank : paymentMethod === 'wallet' ? selectedWallet : paymentMethod === 'cod' ? 'Cash' : `Card Ending ${cardNumber.slice(-4)}`}
                    </p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                  <div className="p-3.5 bg-slate-50/50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Items in Order ({buyNowItem ? 1 : cart.items.length})
                  </div>
                  {buyNowItem ? (
                    <div className="p-4 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <SafeImage src={buyNowItem.product.image} alt={buyNowItem.product.name} className="w-8 h-8 object-contain rounded bg-slate-50 p-0.5 border" />
                        <div className="truncate">
                          <span className="font-bold text-slate-800 block truncate">{buyNowItem.product.name}</span>
                          <span className="text-[10px] text-slate-400 block">Unit: {buyNowItem.product.unit || '1 unit'} | Qty: {buyNowItem.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        ${((buyNowItem.product.discountPrice ?? buyNowItem.product.price) * buyNowItem.quantity).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    cart.items.map((item) => (
                      <div key={item.product.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <SafeImage src={item.product.image} alt={item.product.name} className="w-8 h-8 object-contain rounded bg-slate-50 p-0.5 border" />
                          <div className="truncate">
                            <span className="font-bold text-slate-800 block truncate">{item.product.name}</span>
                            <span className="text-[10px] text-slate-400 block">Unit: {item.product.unit || '1 unit'} | Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">
                          ${((item.product.discountPrice ?? item.product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-slate-600 leading-normal flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                  <span>By confirming checkout, you authorize FreshCart to coordinate dispatch operations. Delivery tracking links will compile inside your profile orders catalog.</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* === RIGHT COLUMN: STICKY ORDER SUMMARY SIDEBAR === */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          {/* Coupon Code Section */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
              <Percent size={18} className="text-emerald-600" />
              <span>Apply Coupon</span>
            </h3>

            {cart.appliedCoupon ? (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-800 block">Active!</span>
                  <span className="text-[10px] text-emerald-650 font-bold uppercase">{cart.appliedCoupon} (15% Off)</span>
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
                  placeholder="Enter code (FRESH15)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold placeholder-slate-450 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-50 transition-all cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-[10px] text-rose-500 font-bold mt-2">{couponError}</p>
            )}
            {couponSuccess && !cart.appliedCoupon && (
              <p className="text-[10px] text-emerald-600 font-bold mt-2">{couponSuccess}</p>
            )}
          </div>

          {/* Checkout Totals Summary Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3 mb-4">Checkout Summary</h3>

            {/* Calculations breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Items Subtotal</span>
                <span className="text-slate-800 font-bold">${activeSubtotal.toFixed(2)}</span>
              </div>

              {activeDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-${activeDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Delivery Partner Fee ({deliveryMethod})</span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Free</span>
                ) : (
                  <span className="text-slate-800 font-bold">${shippingFee.toFixed(2)}</span>
                )}
              </div>

              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Taxes & Charges (8%)</span>
                <span className="text-slate-800 font-bold">${activeTax.toFixed(2)}</span>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              <div className="flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-lg text-emerald-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm & Place Order CTA Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || (!buyNowItem && cart.items.length === 0)}
              isLoading={isPlacingOrder}
              className="w-full mt-6 h-12 rounded-xl text-white font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Place Order</span>
              <ArrowRight size={16} />
            </Button>

            {/* Security SSL indicator */}
            <div className="mt-4 flex flex-col items-center gap-1 text-[10px] text-slate-400 font-bold text-center border-t border-slate-50 pt-4">
              <div className="flex items-center gap-1.5 uppercase">
                <Lock size={12} className="text-emerald-500 shrink-0" />
                <span>SSL Encrypted Checkout</span>
              </div>
              <span className="font-normal text-slate-400 lowercase">Direct payments verified by Stripe.</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
