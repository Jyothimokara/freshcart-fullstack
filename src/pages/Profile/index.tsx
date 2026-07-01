import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Heart, 
  ShoppingBag, 
  ClipboardList, 
  Trash2, 
  Edit2, 
  Plus, 
  Check, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import SafeImage from '../../components/ui/SafeImage';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

type ActiveTab = 'overview' | 'addresses' | 'dashboard';

export default function Profile() {
  const { user, addresses, orders, updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const { wishlistIds } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Overview Form states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  // Address CRUD Form states
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      showToast('Please enter a valid email.', 'error');
      return;
    }

    await updateProfile(profileName.trim(), profileEmail.trim());
  };

  const handleEditAddressInit = (addrId: string) => {
    const addr = addresses.find((a) => a.id === addrId);
    if (addr) {
      setEditingAddressId(addrId);
      setIsAddingAddress(false);
      setAddrName(addr.fullName);
      setAddrPhone(addr.phone);
      setAddrStreet(addr.street);
      setAddrCity(addr.city);
      setAddrState(addr.state);
      setAddrZip(addr.zipCode);
      setFormErrors({});
    }
  };

  const resetAddressForm = () => {
    setAddrName('');
    setAddrPhone('');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrZip('');
    setEditingAddressId(null);
    setIsAddingAddress(false);
    setFormErrors({});
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!addrName.trim()) errors.addrName = 'Name is required';
    if (!addrPhone.trim() || addrPhone.replace(/\D/g, '').length < 10) errors.addrPhone = 'Valid 10-digit phone is required';
    if (!addrStreet.trim()) errors.addrStreet = 'Street address is required';
    if (!addrCity.trim()) errors.addrCity = 'City is required';
    if (!addrState.trim()) errors.addrState = 'State is required';
    if (!addrZip.trim() || addrZip.replace(/\D/g, '').length < 5) errors.addrZip = 'Valid zip code is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const addrData = {
      fullName: addrName.trim(),
      phone: addrPhone.trim(),
      street: addrStreet.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      zipCode: addrZip.trim(),
      isDefault: false
    };

    if (editingAddressId) {
      const success = await updateAddress(editingAddressId, addrData);
      if (success) {
        showToast('Address updated successfully!', 'success');
      }
    } else {
      const newAddr = await addAddress(addrData);
      if (newAddr) {
        showToast('New shipping address added!', 'success');
      }
    }

    resetAddressForm();
  };

  const handleDeleteAddress = async (id: string) => {
    const success = await deleteAddress(id);
    if (success) {
      showToast('Address removed from profile.', 'info');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const success = await setDefaultAddress(id);
    if (success) {
      showToast('Default delivery address updated.', 'success');
    }
  };

  // Recent order detail card (if any orders exist)
  const recentOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'My Account' }]} />

      <div className="max-w-6xl mx-auto mt-6">
        
        {/* === HEADER VIEW === */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-50/50 blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left relative z-10">
            <SafeImage
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'}
              alt={user?.name || 'User Profile'}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
              fallbackSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>"
            />
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">Welcome, {user?.name}!</h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto">
            <Link
              to="/products"
              className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-50 active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span>Shop catalog</span>
            </Link>
          </div>
        </div>

        {/* === GRID CONTENT LAYOUT === */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* === LEFT COLUMN: NAVIGATION SIDEBAR (3 Cols) === */}
          <aside className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row lg:flex-col gap-2 lg:gap-1.5 shrink-0">
            {/* Dashboard Stats */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex items-center justify-center sm:justify-start gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold text-left transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ClipboardList size={16} />
              <span>Overview</span>
            </button>

            {/* Account Settings */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 flex items-center justify-center sm:justify-start gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold text-left transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User size={16} />
              <span>Account Info</span>
            </button>

            {/* Address Book */}
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex-1 flex items-center justify-center sm:justify-start gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold text-left transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'addresses'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin size={16} />
              <span>Addresses</span>
            </button>
          </aside>

          {/* === RIGHT COLUMN: VIEW TAB CONTENT (9 Cols) === */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* --- TAB A: ANALYTICS OVERVIEW DASHBOARD --- */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Stats Widgets Rows */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Total orders card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide leading-none block mb-1">Total Purchases</span>
                      <span className="text-2xl font-black text-slate-900 leading-none">{orders.length} Orders</span>
                    </div>
                    <Link to="/orders" className="absolute top-4 right-4 text-slate-400 hover:text-emerald-600">
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  {/* Wishlist count card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                      <Heart size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide leading-none block mb-1">Liked Products</span>
                      <span className="text-2xl font-black text-slate-900 leading-none">{wishlistIds.length} Items</span>
                    </div>
                    <Link to="/wishlist" className="absolute top-4 right-4 text-slate-400 hover:text-rose-500">
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  {/* Addresses count card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide leading-none block mb-1">Saved Addresses</span>
                      <span className="text-2xl font-black text-slate-900 leading-none">{addresses.length} Locations</span>
                    </div>
                    <button onClick={() => setActiveTab('addresses')} className="absolute top-4 right-4 text-slate-400 hover:text-blue-600 cursor-pointer">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Recent Order widget */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <ClipboardList size={16} className="text-emerald-600" />
                      <span>Latest Organic Order</span>
                    </h3>
                    <Link to="/orders" className="text-xs font-bold text-emerald-650 hover:underline">
                      View All History
                    </Link>
                  </div>

                  {recentOrder ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between text-xs gap-3">
                        <div className="flex gap-4">
                          <div>
                            <span className="text-slate-400 block mb-0.5">Order ID</span>
                            <span className="font-extrabold text-slate-800">{recentOrder.id}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Purchased Date</span>
                            <span className="font-semibold text-slate-800">{new Date(recentOrder.date).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Total Paid</span>
                            <span className="font-black text-emerald-600">${recentOrder.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                          recentOrder.status === 'Delivered' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {recentOrder.status}
                        </span>
                      </div>

                      {/* Items previews */}
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 divide-y divide-slate-150 space-y-2">
                        {recentOrder.items.slice(0, 2).map((item) => (
                          <div key={item.productId} className="first:pt-0 pt-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <SafeImage src={item.image} alt={item.productName} className="w-8 h-8 object-contain rounded bg-white p-0.5 border" />
                              <span className="font-bold text-slate-700 truncate">{item.productName}</span>
                            </div>
                            <span className="text-slate-450 shrink-0">{item.quantity} x ${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                        {recentOrder.items.length > 2 && (
                          <p className="text-[10px] text-slate-400 text-center pt-2 font-semibold">
                            + {recentOrder.items.length - 2} more item(s) in this delivery
                          </p>
                        )}
                      </div>

                      {/* Track / details navigation bar */}
                      <div className="pt-2 flex justify-end gap-2.5">
                        <button
                          onClick={() => navigate('/checkout/success', { state: { orderId: recentOrder.id } })}
                          className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 bg-white shadow-sm"
                        >
                          <ExternalLink size={12} />
                          <span>Track Delivery</span>
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                      You haven't placed any orders yet. Once checked out, details appear here!
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* --- TAB B: ACCOUNT SETTINGS OVERVIEW FORM --- */}
            {activeTab === 'overview' && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-50 pb-3">
                  <h3 className="font-black text-slate-800 text-base">Account Information</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-semibold">Update your profile display details</p>
                </div>

                <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 max-w-xl">
                  <div className="flex gap-4 flex-col sm:flex-row">
                    <div className="flex-1">
                      <Input
                        label="Display Name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Email Address"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex justify-end">
                    <Button type="submit" className="px-6 h-10 cursor-pointer text-xs">
                      <Check size={14} />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* --- TAB C: SHIPPING ADDRESS BOOK MANAGER --- */}
            {activeTab === 'addresses' && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* List saved locations or edit form */}
                {!isAddingAddress && !editingAddressId ? (
                  <>
                    <div className="border-b border-slate-50 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-black text-slate-800 text-base">Address Book</h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-semibold">Manage your default sourcing locations</p>
                      </div>
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="px-4.5 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus size={14} /> Add Sourcing Address
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`p-5 rounded-3xl border flex flex-col justify-between text-left transition-all ${
                            addr.isDefault
                              ? 'border-emerald-500 bg-emerald-50/5 shadow-sm'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                                <MapPin size={14} className="text-emerald-600" />
                                {addr.fullName}
                              </span>
                              {addr.isDefault && (
                                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-emerald-150">
                                  Default Sourcing
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{addr.street}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{addr.city}, {addr.state} {addr.zipCode}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Phone: {addr.phone}</p>
                          </div>

                          {/* Address Action links */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditAddressInit(addr.id)}
                                className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-0.5 cursor-pointer"
                              >
                                <Edit2 size={10} /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-0.5 cursor-pointer"
                              >
                                <Trash2 size={10} /> Delete
                              </button>
                            </div>
                            
                            {!addr.isDefault && (
                              <button 
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg hover:bg-emerald-100 cursor-pointer"
                              >
                                Make Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  // Add / Edit address form
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div className="border-b border-slate-50 pb-3">
                      <h3 className="font-black text-slate-800 text-base">
                        {editingAddressId ? 'Edit Address Book Card' : 'Create New Shipping Address'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-semibold">Enter delivery detail parameters</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Recipient Full Name"
                        placeholder="e.g. John Doe"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        error={formErrors.addrName}
                        required
                      />
                      <Input
                        label="Recipient Phone Number"
                        placeholder="e.g. 555-123-4567"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        error={formErrors.addrPhone}
                        required
                      />
                      <div className="md:col-span-2">
                        <Input
                          label="Street Address Line 1"
                          placeholder="e.g. 100 Main St Apt 3B"
                          value={addrStreet}
                          onChange={(e) => setAddrStreet(e.target.value)}
                          error={formErrors.addrStreet}
                          required
                        />
                      </div>
                      <Input
                        label="City"
                        placeholder="City"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        error={formErrors.addrCity}
                        required
                      />
                      <Input
                        label="State / Province"
                        placeholder="State"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        error={formErrors.addrState}
                        required
                      />
                      <Input
                        label="Postal / Zip Code"
                        placeholder="5-digit code"
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value.replace(/\D/g, ''))}
                        error={formErrors.addrZip}
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
        </div>

      </div>
    </div>
  );
}
