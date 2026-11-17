import { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  ShoppingBagIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  SparklesIcon,
  BoltIcon,
  TagIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

const quickLinks = [
  { name: 'All Collections', to: '/products', icon: SparklesIcon },
  { name: 'Electronics', to: '/products?category=Electronics', icon: BoltIcon },
  { name: 'Beauty & Luxe', to: '/products?category=Beauty', icon: FireIcon },
  { name: 'Fragrances', to: '/products?category=Fragrances', icon: TagIcon },
  { name: 'Fashion', to: '/products?category=Mens%20Clothing', icon: SparklesIcon },
  { name: 'Jewelery', to: '/products?category=Jewelery', icon: SparklesIcon },
  { name: 'Furniture', to: '/products?category=Furniture', icon: TagIcon },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const { getItemCount, fetchCart } = useCartStore();
  const { getItemCount: getWishlistCount, fetchWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartCount = getItemCount();
  const wishlistCount = getWishlistCount();

  return (
    <header className="sticky top-0 z-50">
      {/* Top Announcement Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="font-medium tracking-wide flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Free Express Shipping on orders over ₹500 • Instant Razorpay & COD Checkout</span>
          </p>
          <div className="hidden sm:flex items-center gap-5 text-slate-300">
            <Link to="/support" className="hover:text-white transition-colors">24/7 Concierge</Link>
            <Link to="/orders" className="hover:text-white transition-colors">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main Frosted Glass Navbar */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-header border-b border-slate-200/80'
            : 'bg-white/95 backdrop-blur-md border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20 gap-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <ShoppingBagIcon className="h-6 w-6 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 bg-clip-text text-transparent">
                SalesSavvy
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 -mt-1">
                Curated Studio
              </span>
            </div>
          </Link>

          {/* Pill Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full group">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search luxury beauty, electronics, fashion, brands..."
                className="w-full pl-12 pr-24 py-3 rounded-full text-sm bg-slate-100/90 text-slate-900
                           border border-transparent placeholder-slate-400
                           focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold hover:shadow-md transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Pills */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            {!isAdmin() && (
              <Link
                to="/wishlist"
                className="relative p-2.5 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50/80 transition-all"
                title="Wishlist"
              >
                <HeartIcon className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full font-bold shadow-sm">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Shopping Bag */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100/80 hover:bg-indigo-50 text-slate-800 hover:text-indigo-600 font-semibold text-sm transition-all"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-indigo-300 bg-white shadow-sm transition-all text-sm font-semibold text-slate-700">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user?.firstName || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-indigo-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xs font-bold">
                      {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:inline max-w-[100px] truncate">{user?.firstName}</span>
                  <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-150"
                  enterFrom="transform opacity-0 scale-95 translate-y-1"
                  enterTo="transform opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-100"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 focus:outline-none z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium ${
                              active ? 'bg-indigo-50/70 text-indigo-600' : 'text-slate-700'
                            }`}
                          >
                            <UserIcon className="h-4 w-4" />
                            Account Settings
                          </Link>
                        )}
                      </Menu.Item>

                      {!isAdmin() && (
                        <>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/orders"
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium ${
                                  active ? 'bg-indigo-50/70 text-indigo-600' : 'text-slate-700'
                                }`}
                              >
                                <ShoppingBagIcon className="h-4 w-4" />
                                My Orders
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/wishlist"
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium ${
                                  active ? 'bg-indigo-50/70 text-indigo-600' : 'text-slate-700'
                                }`}
                              >
                                <HeartIcon className="h-4 w-4" />
                                Saved Wishlist
                                {wishlistCount > 0 && (
                                  <span className="ml-auto bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                    {wishlistCount}
                                  </span>
                                )}
                              </Link>
                            )}
                          </Menu.Item>
                        </>
                      )}

                      {isAdmin() && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin"
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold ${
                                active ? 'bg-indigo-50 text-indigo-700' : 'text-indigo-600'
                              }`}
                            >
                              <Squares2X2Icon className="h-4 w-4" />
                              Admin Studio
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium w-full ${
                              active ? 'bg-rose-50 text-rose-600' : 'text-rose-600'
                            }`}
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            Sign Out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands & collections..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm bg-slate-100 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </form>
        </div>

        {/* Sub-Navbar Category Pills */}
        <div className="hidden md:block border-t border-slate-100 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-2.5 overflow-x-auto hide-scrollbar">
            {quickLinks.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all whitespace-nowrap"
              >
                <item.icon className="h-3.5 w-3.5 text-indigo-500" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-2xl animate-fade-in">
          <div className="p-4 space-y-2">
            <p className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Collections</p>
            {quickLinks.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <item.icon className="h-4 w-4 text-indigo-500" />
                {item.name}
              </Link>
            ))}

            <div className="border-t border-slate-100 my-2 pt-2">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Account Settings</Link>
                  <Link to="/orders" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">My Orders</Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link to="/login" className="btn-secondary text-center">Sign In</Link>
                  <Link to="/register" className="btn-primary text-center">Join Free</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
