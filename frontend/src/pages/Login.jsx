import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      const { user } = useAuthStore.getState();
      const isPrivileged = user?.roles?.some((role) => ['ADMIN', 'MANAGER', 'STAFF'].includes(role));
      if (isPrivileged) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row overflow-hidden">
        {/* Left Luxury Editorial Panel */}
        <div className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-8 sm:p-12 md:w-5/12 text-white flex flex-col justify-between overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6">
              <ShoppingBagIcon className="h-6 w-6 text-indigo-300" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">
              <SparklesIcon className="h-4 w-4" />
              <span>Welcome Back</span>
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">
              Sign in to SalesSavvy Studio
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Access your curated wishlist, real-time order tracking, and instant one-click Razorpay checkout.
            </p>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 mt-8 text-xs text-slate-400">
            Demo Credentials:<br />
            <span className="text-slate-200 font-semibold">user@example.com / user123</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Member Sign In</h2>
          <p className="text-sm text-slate-500 mb-8">Enter your registered email and password below</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3.5 text-xs font-semibold rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <div>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="input-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-11"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 text-sm font-bold"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In to Account'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600">
              New to SalesSavvy?{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                Create a free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
