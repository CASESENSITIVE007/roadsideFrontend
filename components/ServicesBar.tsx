// components/ServicesBar.tsx
'use client';
import { Truck, Zap, AlertCircle, Fuel, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SERVICES = [
  { icon: Truck, name: 'Towing' },
  { icon: Zap, name: 'Battery Jump' },
  { icon: AlertCircle, name: 'Flat Tire' },
  { icon: Fuel, name: 'Fuel Delivery' },
  { icon: Lock, name: 'Lockout' },
];

export default function ServicesBar() {
  const router = useRouter();
  
  return (
    <div className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22]">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <p className="text-center text-slate-500 text-sm font-medium mb-6 uppercase tracking-wider">Services available 24/7 nationwide</p>
        <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
          {SERVICES.map((s) => {
            const IconComponent = s.icon;
            return (
            <div key={s.name} onClick={() => router.push('/dashboard/user')} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 group-hover:text-primary transition-colors">
                <IconComponent className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}