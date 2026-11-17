import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowPathIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productsAPI, categoriesAPI } from '../services/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCollection, setActiveCollection] = useState('featured');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, bestRes, newRes, categoriesRes] = await Promise.all([
          productsAPI.getFeatured({ size: 8 }),
          productsAPI.getBestSellers({ size: 8 }),
          productsAPI.getNewArrivals({ size: 8 }),
          categoriesAPI.getAll(),
        ]);
        setFeaturedProducts(featuredRes.data?.data?.content || []);
        setBestSellers(bestRes.data?.data?.content || []);
        setNewArrivals(newRes.data?.data?.content || []);
        setCategories(categoriesRes.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayedProducts =
    activeCollection === 'featured'
      ? featuredProducts.length > 0 ? featuredProducts : bestSellers
      : activeCollection === 'bestsellers'
      ? bestSellers
      : newArrivals;

  const perks = [
    {
      icon: TruckIcon,
      title: 'Express Doorstep Delivery',
      desc: 'Complimentary shipping on orders above ₹500',
      accent: 'bg-indigo-50 text-indigo-600',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Razorpay Buyer Protection',
      desc: '100% encrypted UPI, Card & NetBanking checkout',
      accent: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: BoltIcon,
      title: 'Verified Global Brands',
      desc: 'Curated catalog with real ratings & reviews',
      accent: 'bg-amber-50 text-amber-600',
    },
    {
      icon: ArrowPathIcon,
      title: '30-Day Effortless Returns',
      desc: 'No-questions-asked instant exchange & refund',
      accent: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <div className="animate-fade-in space-y-14 pb-8">
      {/* Modern Editorial Hero + Bento Grid */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-8 pb-14 lg:py-16">
        {/* Ambient Decorative Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Editorial Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-indigo-300">
                <SparklesIcon className="h-4 w-4 text-amber-400" />
                <span>New Season Edit • Powered by DummyJSON & FakeStore Catalog</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Elevate Your Everyday{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
                  Lifestyle & Tech.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Discover 50+ handpicked essentials across luxury fragrances, next-gen electronics, designer apparel, and modern furniture — backed by verified customer reviews.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:scale-[1.02] transition-all"
                >
                  <span>Explore Full Catalog</span>
                  <ArrowRightIcon className="h-4 w-4 stroke-[2.5]" />
                </Link>
                <Link
                  to="/products?sortBy=averageRating&sortDir=desc"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm backdrop-blur-md transition-all"
                >
                  <StarIconSolid className="h-4 w-4 text-amber-400" />
                  <span>Top Rated (4.5★+)</span>
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-lg">
                <div>
                  <p className="text-2xl font-extrabold text-white">55+</p>
                  <p className="text-xs text-slate-400">Curated Products</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">140+</p>
                  <p className="text-xs text-slate-400">Verified Reviews</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">12</p>
                  <p className="text-xs text-slate-400">Luxe Categories</p>
                </div>
              </div>
            </div>

            {/* Right Bento Showcase Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <Link
                to="/products?category=Beauty"
                className="col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/20 via-fuchsia-500/15 to-slate-900 border border-white/10 p-6 flex items-center justify-between hover:border-rose-400/40 transition-all"
              >
                <div className="space-y-2 max-w-[60%]">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-rose-300">Beauty & Fragrances</span>
                  <h3 className="text-xl font-extrabold text-white">Luxury Skincare & Perfumes</h3>
                  <p className="text-xs text-slate-300">Up to 25% off iconic designer scents</p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-300 pt-1 group-hover:translate-x-1 transition-transform">
                    Shop Edit <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=400"
                  alt="Fragrances"
                  className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform"
                />
              </Link>

              <Link
                to="/products?category=Electronics"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/20 to-slate-900 border border-white/10 p-5 flex flex-col justify-between hover:border-indigo-400/40 transition-all"
              >
                <img
                  src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300"
                  alt="Electronics"
                  className="w-full h-28 object-cover rounded-2xl mb-4 group-hover:scale-105 transition-transform"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Next-Gen Tech</span>
                  <h3 className="text-base font-bold text-white mt-0.5">Pro Electronics</h3>
                </div>
              </Link>

              <Link
                to="/products?category=Jewelery"
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 to-slate-900 border border-white/10 p-5 flex flex-col justify-between hover:border-amber-400/40 transition-all"
              >
                <img
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300"
                  alt="Jewelery"
                  className="w-full h-28 object-cover rounded-2xl mb-4 group-hover:scale-105 transition-transform"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Artisanal Craft</span>
                  <h3 className="text-base font-bold text-white mt-0.5">Fine Jewelery</h3>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {perks.map((perk, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex items-start gap-4 hover:shadow-lg transition-all"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${perk.accent}`}>
                <perk.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{perk.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Category Pills Carousel / Grid */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Browse by Department</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Curated Categories</h2>
            </div>
            <Link
              to="/products"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              View All <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group relative rounded-2xl bg-white border border-slate-100 p-3 shadow-sm hover:shadow-card-hover hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-3">
                  <img
                    src={category.image || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Tabbed Product Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Handpicked For You</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Trending Studio Picks</h2>
          </div>

          {/* Interactive Collection Pills */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/70 self-start">
            {[
              { id: 'featured', label: 'Spotlight' },
              { id: 'bestsellers', label: 'Most Reviewed' },
              { id: 'new', label: 'New Arrivals' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCollection(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeCollection === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Most Loved / Customer Favorites Section */}
      {!isLoading && bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-6 sm:p-10 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                  <FireIcon className="h-4 w-4" />
                  <span>Highest Rated By Shoppers</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold">Customer Hall of Fame</h2>
              </div>
              <Link
                to="/products?sortBy=reviewCount&sortDir=desc"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all self-start"
              >
                <span>See All Top Rated</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-900">
              {bestSellers.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
