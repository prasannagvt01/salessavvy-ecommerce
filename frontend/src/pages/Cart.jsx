import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useCartStore } from '../store/cartStore';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    isLoading,
    fetchCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      await updateItemQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setIsApplying(true);
    await applyCoupon(couponInput);
    setCouponInput('');
    setIsApplying(false);
  };

  if (isLoading && !cart) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const items = cart?.items || [];
  const trueSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cart?.discount || 0;
  const taxableAmount = Math.max(0, trueSubtotal - discount);
  const tax = taxableAmount * 0.18;
  const shipping = taxableAmount > 500 ? 0 : 50;
  const total = taxableAmount + tax + shipping;

  return (
    <div className="max-w-[1280px] mx-auto px-2 sm:px-4 py-4 animate-fade-in">
      {items.length === 0 ? (
        <div className="bg-white shadow-card text-center py-20">
          <ShoppingBagIcon className="h-24 w-24 mx-auto text-gray-200 mb-6" />
          <h2 className="text-lg font-medium text-[#212121] mb-2">Your cart is empty!</h2>
          <p className="text-sm text-[#878787] mb-6">Add items to it now.</p>
          <Link to="/products" className="inline-block px-12 py-3 bg-[#2874F0] text-white font-bold text-sm rounded-sm hover:shadow-md">
            Shop now
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white shadow-card">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h1 className="text-lg font-medium text-[#212121]">
                  My Cart ({items.length})
                </h1>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items */}
              {items.map((item, index) => (
                <div
                  key={item.productId}
                  className={`px-6 py-5 flex gap-4 ${index < items.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Image */}
                  <div className="w-[112px] h-[112px] bg-gray-50 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.productImage || 'https://via.placeholder.com/150'}
                      alt={item.productName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="text-base text-[#212121] hover:text-[#2874F0] line-clamp-1"
                    >
                      {item.productName}
                    </Link>

                    <p className="text-sm text-[#878787] mt-1">
                      Seller: Sales Savvy
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-lg font-medium text-[#212121]">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <span className="text-sm text-[#878787]">
                        ₹{item.price.toLocaleString()} × {item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center
                                   disabled:opacity-30 hover:bg-gray-50 transition-colors"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="w-12 text-center text-sm font-medium border-y border-gray-300 h-7 flex items-center justify-center mx-0.5">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity, 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center
                                   hover:bg-gray-50 transition-colors"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-sm font-bold text-[#212121] hover:text-red-500 uppercase tracking-wide"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <p className="text-xs text-[#878787]">Delivery by</p>
                    <p className="text-xs font-medium text-[#212121]">3-5 days</p>
                    {shipping === 0 && (
                      <p className="text-xs text-[#388E3C] font-medium mt-1">Free ✓</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Place Order (Mobile) */}
              <div className="p-4 border-t border-gray-100 lg:hidden sticky bottom-0 bg-white shadow-lg">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-[#FB641B] text-white font-bold text-sm rounded-sm hover:shadow-md"
                >
                  PLACE ORDER
                </button>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="bg-white shadow-card sticky top-20">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xs font-bold text-[#878787] uppercase tracking-wider">Price Details</h2>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#212121]">Price ({items.length} items)</span>
                  <span className="text-[#212121]">₹{trueSubtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#212121]">Discount</span>
                    <span className="text-[#388E3C]">− ₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-[#212121]">Tax (18% GST)</span>
                  <span className="text-[#212121]">₹{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#212121]">Delivery Charges</span>
                  <span className={shipping === 0 ? 'text-[#388E3C]' : 'text-[#212121]'}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>

                {shipping > 0 && (
                  <p className="text-xs text-[#2874F0]">
                    Add ₹{(500 - taxableAmount).toLocaleString()} more for free delivery
                  </p>
                )}

                <div className="border-t border-dashed border-gray-300 pt-4">
                  <div className="flex justify-between font-bold text-base">
                    <span className="text-[#212121]">Total Amount</span>
                    <span className="text-[#212121]">₹{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {discount > 0 && (
                  <p className="text-sm text-[#388E3C] font-medium">
                    You will save ₹{discount.toLocaleString()} on this order
                  </p>
                )}
              </div>

              {/* Coupon */}
              <div className="px-6 py-4 border-t border-gray-100">
                {cart?.appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-sm">
                    <span className="text-sm text-[#388E3C] font-medium">{cart.appliedCoupon} applied</span>
                    <button onClick={removeCoupon} className="text-xs text-red-500 font-bold uppercase hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#2874F0]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplying || !couponInput}
                      className="px-4 py-2 text-sm font-bold text-[#2874F0] border border-[#2874F0] rounded-sm
                               hover:bg-[#F5F8FF] disabled:opacity-40"
                    >
                      APPLY
                    </button>
                  </div>
                )}
              </div>

              {/* Place Order */}
              <div className="px-6 py-4 border-t border-gray-100 hidden lg:block">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-[#FB641B] text-white font-bold text-sm rounded-sm hover:shadow-md transition-shadow"
                >
                  PLACE ORDER
                </button>
              </div>

              <div className="px-6 py-3 border-t border-gray-100">
                <Link to="/products" className="text-sm text-[#2874F0] hover:underline font-medium">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
