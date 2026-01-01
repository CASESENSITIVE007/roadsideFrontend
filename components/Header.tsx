// components/Header.tsx
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 dark:border-[#283039] px-6 lg:px-10 py-3 bg-white dark:bg-[#111418] sticky top-0 z-50">
      <div className="flex items-center gap-4 text-slate-900 dark:text-white cursor-pointer">
        <AlertTriangle className="w-8 h-8 text-primary" />
        <h2 className="text-lg font-bold tracking-[-0.015em]">Roadside Assist</h2>
      </div>
      <div className="flex flex-1 justify-end gap-4 lg:gap-8 items-center">
        <nav className="hidden md:flex items-center gap-6 lg:gap-9">
          <Link href="/register?role=provider" className="text-slate-600 dark:text-slate-200 hover:text-primary text-sm font-medium transition-colors">For Providers</Link>
          <Link href="/login" className="text-slate-600 dark:text-slate-200 hover:text-primary text-sm font-medium transition-colors">For Admins</Link>
          <Link href="/login" className="text-slate-600 dark:text-slate-200 hover:text-primary text-sm font-medium transition-colors">Login</Link>
        </nav>
        <button className="bg-primary hover:bg-blue-600 text-white px-4 h-10 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-500/20">
          Quick Call 24/7
        </button>
      </div>
    </header>
  );
}