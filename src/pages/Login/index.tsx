import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Login() {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target: go back to the page that triggered auth, or Home
  const from = (location.state as { from?: any })?.from || '/';

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const targetPath = typeof from === 'object' ? from.pathname : from;
      const targetState = typeof from === 'object' ? from.state : undefined;
      navigate(targetPath, { replace: true, state: targetState });
    }
  }, [user, navigate, from]);

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        showToast('Welcome Back! Login Successful', 'success');
        const targetPath = typeof from === 'object' ? from.pathname : from;
        const targetState = typeof from === 'object' ? from.state : undefined;
        navigate(targetPath, { replace: true, state: targetState });
      } else {
        showToast('Invalid email or password. Please try again.', 'error');
        setErrors({ auth: 'Invalid email or password' });
      }
    } catch (err) {
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    showToast(`Signing in with ${provider} is currently disabled in this demo.`, 'info');
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter your email address to reset password.', 'error');
      setErrors({ email: 'Enter email to reset password' });
    } else {
      showToast(`Password reset link sent to ${email}`, 'success');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-50/50 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-slate-100/50 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 text-center">
          {/* Brand Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-emerald-100">
              F
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Fresh<span className="text-emerald-650">Cart</span> Login
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Sign in to access your organic cart
          </p>
        </div>

        {errors.auth && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold relative z-10 animate-shake">
            <ShieldAlert size={16} className="shrink-0 text-rose-500" />
            <span>{errors.auth}</span>
          </div>
        )}

        <form className="mt-8 space-y-5 relative z-10" onSubmit={handleLoginSubmit}>
          <div className="space-y-4">
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.email;
                      return copy;
                    });
                  }
                }}
                error={errors.email}
                required
              />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.password;
                      return copy;
                    });
                  }
                }}
                error={errors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <a
              href="#forgot-password"
              onClick={handleForgotPassword}
              className="font-extrabold text-emerald-650 hover:text-emerald-700 transition-colors hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full text-xs h-11 font-extrabold cursor-pointer"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="relative z-10 flex items-center justify-center my-6">
          <div className="border-t border-slate-100 w-full"></div>
          <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold shrink-0">
            or continue with
          </span>
          <div className="border-t border-slate-100 w-full"></div>
        </div>

        {/* Social login buttons */}
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <button
            onClick={() => handleSocialLogin('Google')}
            className="flex h-11 items-center justify-center gap-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-xs text-slate-700 active:scale-95 cursor-pointer bg-white"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin('Apple')}
            className="flex h-11 items-center justify-center gap-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-xs text-slate-700 active:scale-95 cursor-pointer bg-white"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.05-1 .04-2.22.67-2.94 1.51-.64.73-1.2 1.87-1.08 2.97 1.1.09 2.24-.55 2.93-1.43z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        <div className="relative z-10 text-center text-xs font-semibold text-slate-500 mt-6">
          New to FreshCart?{' '}
          <Link
            to="/register"
            className="font-extrabold text-emerald-650 hover:text-emerald-700 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
