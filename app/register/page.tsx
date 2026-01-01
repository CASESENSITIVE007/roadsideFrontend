// app/register/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Key, User, Settings } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function Register() {
  const [role, setRole] = useState<'user' | 'provider'>('user');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username: email.split('@')[0],
        email,
        password,
        first_name: fullName.split(' ')[0],
        last_name: fullName.split(' ').slice(1).join(' ') || fullName.split(' ')[0],
        role: role,
      };

      // Use the correct register endpoint
      await apiClient.register(userData);

      // Registration successful, redirect to login
      alert('Registration successful! Please login.');
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-light dark:bg-[#0d0f12]">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-[#1c2127] rounded-2xl shadow-xl border border-slate-200 dark:border-[#3b4754] overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create Account</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Join Roadside Assist and get help on the road.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  I am a
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input 
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer" 
                      id="user-role" 
                      name="role"
                      type="radio"
                      value="user"
                      checked={role === 'user'}
                      onChange={(e) => setRole(e.target.value as 'user' | 'provider')}
                    />
                    <label className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer" htmlFor="user-role">
                      Driver / User
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer" 
                      id="provider-role" 
                      name="role"
                      type="radio"
                      value="provider"
                      checked={role === 'provider'}
                      onChange={(e) => setRole(e.target.value as 'user' | 'provider')}
                    />
                    <label className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer" htmlFor="provider-role">
                      Service Provider / Tow Truck Owner
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="username">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    className="w-full bg-slate-50 dark:bg-[#111418] border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm" 
                    id="username" 
                    placeholder="Enter your full name" 
                    required 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    className="w-full bg-slate-50 dark:bg-[#111418] border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm" 
                    id="email" 
                    placeholder="Enter your email" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    className="w-full bg-slate-50 dark:bg-[#111418] border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm" 
                    id="password" 
                    placeholder="Create a strong password" 
                    required 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">At least 8 characters with uppercase, lowercase, and numbers</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    className="w-full bg-slate-50 dark:bg-[#111418] border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm" 
                    id="confirm-password" 
                    placeholder="Confirm your password" 
                    required 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input 
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                  id="terms" 
                  required 
                  type="checkbox"
                />
                <label className="ml-2 block text-sm text-slate-600 dark:text-slate-400" htmlFor="terms">
                  I agree to the <a className="text-primary hover:underline" href="#terms">Terms of Service</a> and <a className="text-primary hover:underline" href="#privacy">Privacy Policy</a>
                </label>
              </div>

              <button 
                className="w-full flex items-center justify-center h-12 bg-primary hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#1c2127] text-slate-500 dark:text-slate-400">or</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Already have an account? 
                <Link className="text-primary font-bold hover:underline transition-all ml-1" href="/login">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Partner Link */}
          <div className="bg-slate-50 dark:bg-[#161b20] py-4 px-8 border-t border-slate-200 dark:border-[#3b4754] flex justify-center items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Are you a Service Provider? <Link className="text-slate-700 dark:text-slate-300 hover:text-primary underline" href="/register?role=provider">Partner Sign Up</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
