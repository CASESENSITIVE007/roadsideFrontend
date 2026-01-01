// components/LoginForm.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Key, Settings, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.login({ email, password });
      
      // Route based on user role
      const role = response.user.role;
      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'provider') {
        router.push('/dashboard/provider');
      } else {
        router.push('/dashboard/user');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background-light dark:bg-[#0d0f12]">
    <div className="w-full max-w-md relative z-10">
      <div className="bg-white dark:bg-[#1c2127] rounded-2xl shadow-xl border border-slate-200 dark:border-[#3b4754] overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2" htmlFor="email">
                Email or Username
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
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                  Password
                </label>
                <Link className="text-sm font-medium text-primary hover:text-blue-500 transition-colors" href="#forgot-password">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="w-5 h-5 text-slate-400" />
                </div>
                <input 
                  className="w-full bg-slate-50 dark:bg-[#111418] border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm" 
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button className="w-full flex items-center justify-center h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
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
              New to Roadside Assist? 
              <Link className="text-primary font-bold hover:underline transition-all ml-1" href="/register">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Partner Link */}
        <div className="bg-slate-50 dark:bg-[#161b20] py-4 px-8 border-t border-slate-200 dark:border-[#3b4754] flex justify-center items-center gap-2">
          <Settings className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Are you a Service Provider? <Link className="text-slate-700 dark:text-slate-300 hover:text-primary underline" href="/register?role=provider">Partner Login</Link>
          </span>
        </div>
      </div>
    </div>
    </div>
  );
}