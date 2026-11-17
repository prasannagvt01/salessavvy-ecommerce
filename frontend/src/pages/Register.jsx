import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { register, googleLogin, isLoading, error } = useAuthStore();

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'xxxx',
        callback: handleGoogleResponse,
      });
      google.accounts.id.renderButton(document.getElementById('googleRegisterDiv'), {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signup_with',
      });
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    const result = await googleLogin(response.credential);
    if (result.success) {
      toast.success('Signed up with Google');
      navigate('/');
    } else {
      toast.error(result.error || 'Google sign up failed');
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    if (result && result.success) {
      toast.success('Registration successful! Welcome to SalesSavvy.');
      navigate('/');
    } else {
      const errMsg = result?.error || 'Registration failed. Please check your details.';
      setValidationError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-[84vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row overflow-hidden">
        {/* Left Brand Panel */}
        <div className="relative bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-900 p-8 sm:p-12 md:w-5/12 text-white flex flex-col justify-between overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3">
              <SparklesIcon className="h-4 w-4" />
              <span>Join SalesSavvy Club</span>
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mb-4">
              Create Your Personal Shopping Profile
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unlock member-only deals, instant order updates via email, saved addresses, and verified reviews.
            </p>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 mt-8 flex items-center gap-3 text-xs text-slate-300">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span>Protected with JWT & BCrypt enterprise security</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 p-8 sm:p-12">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Create Account</h2>
          <p className="text-sm text-slate-500 mb-6">Fill in your details to get started in seconds</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || validationError) && (
              <div className="bg-rose-50 text-rose-600 p-3.5 text-xs font-semibold rounded-xl border border-rose-200">
                {error || validationError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Aarav"
                  required
                />
              </div>
              <div>
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Sharma"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="input-label">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <label className="input-label">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 text-sm font-bold mt-2"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create My Account'}
            </button>
          </form>

          <div className="mt-4">
            <div id="googleRegisterDiv" className="w-full" />
          </div>

          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
