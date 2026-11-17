import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  HeartIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function ProductCard({ product }) {
  const { addToCart, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const result = await addToCart(product.id, 1);
    if (result?.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1800);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (inWishlist) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const discountPercentage =
    product.discountPercentage ||
    (product.discountPrice && product.price
      ? Math.round((1 - product.discountPrice / product.price) * 100)
      : 0);

  const rating = Number(product.averageRating || 4.4);
  const reviewCount = product.reviewCount || 0;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <Link to={`/products/${product.id}`} className="block group h-full">
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-card hover:shadow-card-hover hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50/90 to-slate-100/50 flex items-center justify-center p-5 overflow-hidden">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-sm"
            loading="lazy"
          />

          {/* Top Left Pills */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPercentage > 0 && (
              <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                -{discountPercentage}%
              </span>
            )}
            {product.featured && (
              <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Spotlight
              </span>
            )}
          </div>

          {/* Wishlist Floating Glass Button */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md shadow-sm flex items-center justify-center transition-all duration-200 ${
              inWishlist
                ? 'bg-rose-50 text-rose-500 scale-105'
                : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            {inWishlist ? <HeartIconSolid className="h-4 w-4" /> : <HeartIcon className="h-4 w-4" />}
          </button>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-white bg-slate-900/90 px-3.5 py-1.5 rounded-full">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full truncate max-w-[140px]">
              {product.categoryName || product.brand || 'Collection'}
            </span>
            {rating > 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 flex-shrink-0">
                <StarIconSolid className="h-3.5 w-3.5 text-amber-400" />
                <span>{rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({reviewCount})</span>
              </div>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          {/* Short Description */}
          {product.description && (
            <p className="text-xs text-slate-500 line-clamp-1 mb-3">
              {product.description}
            </p>
          )}

          {/* Price & Action Footer */}
          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold text-slate-900">
                  ₹{Number(product.discountPrice || product.price || 0).toLocaleString()}
                </span>
                {discountPercentage > 0 && product.price && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">Free Express Delivery</p>
            </div>

            {!isOutOfStock && (
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-500/20'
                }`}
              >
                {addedToCart ? (
                  <>
                    <CheckIcon className="h-4 w-4 stroke-[2.5]" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="h-4 w-4" />
                    <span>Add</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
