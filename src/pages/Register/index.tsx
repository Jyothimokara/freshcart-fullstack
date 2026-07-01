import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

type PasswordStrength = 'weak' | 'medium' | 'strong' | '';

export default function Register() {
  const { user, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile', { replace: true });
    }
  }, [user, navigate]);

  // Form fields state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('');

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    if (password.length < 6) {
      setPasswordStrength('weak');
      return;
    }

    let score = 0;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      setPasswordStrength('weak');
    } else if (score === 2) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }, [password]);

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};

    if (!firstName.trim()) tempErrors.firstName = 'First name is required';
    if (!lastName.trim()) tempErrors.lastName = 'Last name is required';
    
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        tempErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      tempErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const success = await register(fullName, email.trim(), password);
      
      if (success) {
        showToast('Account registered successfully! Welcome to FreshCart.', 'success');
        navigate('/profile');
      } else {
        showToast('Registration failed. Please check your credentials.', 'error');
        setErrors({ auth: 'Registration failed. Email might already be in use.' });
      }
    } catch (err) {
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'text-rose-500 bg-rose-500';
      case 'medium':
        return 'text-amber-500 bg-amber-500';
      case 'strong':
        return 'text-emerald-500 bg-emerald-500';
      default:
        return 'text-slate-200 bg-slate-200';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Weak (Use letters, numbers & characters)';
      case 'medium':
        return 'Medium (Add special characters/uppercase)';
      case 'strong':
        return 'Strong Password';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-xl w-full space-y-8 bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm relative overflow-hidden">
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
            Create an Account
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Join FreshCart for fresh organic groceries
          </p>
        </div>

        {errors.auth && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold relative z-10">
            <ShieldAlert size={16} className="shrink-0 text-rose-500" />
            <span>{errors.auth}</span>
          </div>
        )}

        <form className="mt-8 space-y-5 relative z-10" onSubmit={handleRegisterSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="First Name"
                placeholder="John"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.firstName;
                      return copy;
                    });
                  }
                }}
                error={errors.firstName}
                required
              />
            </div>
            <div>
              <Input
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.lastName;
                      return copy;
                    });
                  }
                }}
                error={errors.lastName}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
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
            <div>
              <Input
                label="Phone Number"
                type="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.phone;
                      return copy;
                    });
                  }
                }}
                error={errors.phone}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.confirmPassword;
                      return copy;
                    });
                  }
                }}
                error={errors.confirmPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1.5 animate-fadeIn">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                <span className="text-slate-400">Security Check</span>
                <span className={passwordStrength === 'weak' ? 'text-rose-500' : passwordStrength === 'medium' ? 'text-amber-500' : 'text-emerald-500'}>
                  {getStrengthText()}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                <div className={`h-full flex-1 transition-all duration-300 ${passwordStrength ? getStrengthColor().split(' ')[1] : 'bg-slate-100'}`} />
                <div className={`h-full flex-1 transition-all duration-300 ${passwordStrength === 'medium' || passwordStrength === 'strong' ? getStrengthColor().split(' ')[1] : 'bg-slate-100'}`} />
                <div className={`h-full flex-1 transition-all duration-300 ${passwordStrength === 'strong' ? getStrengthColor().split(' ')[1] : 'bg-slate-100'}`} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-start gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => {
                  setAgreeToTerms(e.target.checked);
                  if (errors.agreeToTerms) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.agreeToTerms;
                      return copy;
                    });
                  }
                }}
                className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4 mt-0.5 cursor-pointer"
              />
              <span>
                I agree to the{' '}
                <a href="#terms" onClick={(e) => { e.preventDefault(); showToast('Demo Terms and Conditions shown.', 'info'); }} className="text-emerald-650 hover:underline font-bold">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" onClick={(e) => { e.preventDefault(); showToast('Demo Privacy Policy shown.', 'info'); }} className="text-emerald-650 hover:underline font-bold">
                  Privacy Policy
                </a>.
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-xs text-rose-500 font-medium">{errors.agreeToTerms}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full text-xs h-11 font-extrabold cursor-pointer"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </div>
        </form>

        <div className="relative z-10 text-center text-xs font-semibold text-slate-500 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-extrabold text-emerald-650 hover:text-emerald-700 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
