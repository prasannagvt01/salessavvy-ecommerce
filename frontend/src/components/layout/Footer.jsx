import { Link } from 'react-router-dom';
import { ShoppingBagIcon, SparklesIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 mt-16 border-t border-slate-800/80">
      {/* Top Value Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TruckIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Express Pan-India Delivery</h4>
              <p className="text-xs text-slate-400">Complimentary shipping on orders above ₹500</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Authentic & Verified</h4>
              <p className="text-xs text-slate-400">Protected by Razorpay 256-bit encrypted checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">30-Day Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400">Instant refunds and doorstep pickup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg">
                <ShoppingBagIcon className="h-5 w-5 stroke-[2]" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                SalesSavvy
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Your modern destination for curated electronics, luxury beauty, designer fashion, and artisanal home essentials.
            </p>
            <p className="text-xs text-slate-500">
              Headquarters: Bengaluru, Karnataka, India • support@salessavvy.com
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Collections</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/products?category=Electronics" className="hover:text-indigo-400 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Beauty" className="hover:text-indigo-400 transition-colors">Beauty & Skincare</Link></li>
              <li><Link to="/products?category=Fragrances" className="hover:text-indigo-400 transition-colors">Luxury Fragrances</Link></li>
              <li><Link to="/products?category=Jewelery" className="hover:text-indigo-400 transition-colors">Fine Jewelery</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Concierge</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/orders" className="hover:text-indigo-400 transition-colors">Track Your Order</Link></li>
              <li><Link to="/shipping" className="hover:text-indigo-400 transition-colors">Shipping Guide</Link></li>
              <li><Link to="/returns" className="hover:text-indigo-400 transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-indigo-400 transition-colors">Help & FAQ</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/support" className="hover:text-indigo-400 transition-colors">Customer Support</Link></li>
              <li><Link to="/profile" className="hover:text-indigo-400 transition-colors">My Account</Link></li>
              <li><Link to="/wishlist" className="hover:text-indigo-400 transition-colors">Saved Wishlist</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SalesSavvy Curated Studio. Crafted with Spring Boot & React.</p>
          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">Razorpay Verified</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">256-Bit SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
