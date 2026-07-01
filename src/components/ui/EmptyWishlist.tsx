import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto my-8">
      {/* Icon Wrapper */}
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
        <Heart size={40} strokeWidth={1.5} className="fill-rose-500/10" />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Your Wishlist is Empty</h3>
      <p className="text-slate-500 max-w-sm mb-8">
        Save items you love to your wishlist. They'll show up here so you can add them to your cart later!
      </p>

      {/* CTA Button */}
      <Link
        to="/products"
        className="inline-flex items-center justify-center px-6 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-md active:scale-95"
      >
        Discover Products
      </Link>
    </div>
  );
}
