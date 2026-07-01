import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto my-8">
      {/* Icon Wrapper */}
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 animate-bounce-slow">
        <ShoppingBag size={40} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Shopping Cart is Empty</h3>
      <p className="text-slate-500 max-w-sm mb-8">
        Looks like you haven't added any fresh groceries to your cart yet. Let's explore our catalog!
      </p>

      {/* CTA Button */}
      <Link
        to="/products"
        className="inline-flex items-center justify-center px-6 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-md shadow-emerald-100 hover:shadow-lg active:scale-95"
      >
        Shop Fresh Groceries
      </Link>
    </div>
  );
}
