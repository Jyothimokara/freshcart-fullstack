import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CreditCard } from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const Facebook: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Instagram: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900">
      {/* Top Banner (Newsletter & Trust Signals) */}
      <div className="border-b border-slate-900 py-10">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h4 className="text-xl font-bold text-white mb-2">Subscribe to our newsletter</h4>
            <p className="text-slate-400 text-sm">Get weekly updates on fresh arrivals, daily deals, and special discount coupon codes.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md lg:ml-auto w-full">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="flex-grow h-11 px-4 rounded-xl border border-slate-800 bg-slate-900/60 focus:bg-slate-900 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Column 1: Brand & Contact Info */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
              F
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Fresh<span className="text-emerald-600">Cart</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your neighborhood online grocery store delivering fresh organic fruits, vegetables, dairy products, and pantry staples directly to your doorstep.
          </p>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>123 Fresh Valley Lane, San Francisco, CA 94107</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-emerald-500 shrink-0" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-emerald-500 shrink-0" />
              <span>support@freshcart.com</span>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Quick Links</h5>
          <ul className="flex flex-col gap-3.5 text-sm">
            <li>
              <Link to="/" className="hover:text-emerald-500 transition-colors">Home Page</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-emerald-500 transition-colors">Shop Catalog</Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-emerald-500 transition-colors">Categories</Link>
            </li>
            <li>
              <Link to="/deals" className="hover:text-emerald-500 transition-colors">Daily Deals</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-emerald-500 transition-colors">About FreshCart</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Support */}
        <div>
          <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Customer Support</h5>
          <ul className="flex flex-col gap-3.5 text-sm">
            <li>
              <Link to="/contact" className="hover:text-emerald-500 transition-colors">Contact Support</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-emerald-500 transition-colors">Help & FAQs</Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-emerald-500 transition-colors">Track Your Order</Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-emerald-500 transition-colors">Account Settings</Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-emerald-500 transition-colors">My Wishlist</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal & Policies */}
        <div>
          <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Policies & Legal</h5>
          <ul className="flex flex-col gap-3.5 text-sm mb-6">
            <li>
              <span className="hover:text-emerald-500 transition-colors cursor-pointer">Privacy Policy</span>
            </li>
            <li>
              <span className="hover:text-emerald-500 transition-colors cursor-pointer">Terms of Service</span>
            </li>
            <li>
              <span className="hover:text-emerald-500 transition-colors cursor-pointer">Shipping & Delivery Rates</span>
            </li>
            <li>
              <span className="hover:text-emerald-500 transition-colors cursor-pointer">Returns & Refund Policy</span>
            </li>
          </ul>
          <div className="flex gap-2.5 items-center">
            <CreditCard size={18} className="text-slate-500" />
            <span className="text-xs text-slate-500">Secure 256-bit SSL Payment Gateway</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Socials */}
      <div className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            © 2026 FreshCart E-Commerce. Built for recruiter review and portfolio evaluation.
          </span>
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 hover:text-white hover:bg-emerald-600 transition-all"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 hover:text-white hover:bg-emerald-600 transition-all"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 hover:text-white hover:bg-emerald-600 transition-all"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
