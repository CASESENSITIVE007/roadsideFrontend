// components/Hero.tsx
'use client';
import { MapPin, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="flex flex-col lg:flex-row gap-10 items-center">
        <div className="flex-1 flex flex-col gap-6 w-full lg:max-w-[600px]">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase">Avg Response: 15 mins</span>
            </div>
            <h1 className="text-slate-900 dark:text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
              Stranded? <br /><span className="text-primary">We're on the way.</span>
            </h1>
            <p className="text-slate-600 dark:text-[#9dabb9] text-lg max-w-[500px]">
              Get help in 20 minutes or less. Track your recovery vehicle in real-time.
            </p>
          </div>
          <div className="flex flex-col w-full max-w-[500px] gap-3">
            <div className="flex w-full items-center rounded-xl bg-white dark:bg-[#283039] border border-slate-200 dark:border-slate-700 p-1">
              <MapPin className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white px-3 h-12" placeholder="Enter breakdown location..." />
              <button onClick={() => router.push('/dashboard/user')} className="hidden sm:flex h-12 px-6 bg-primary text-white font-bold rounded-lg items-center transition-colors hover:bg-blue-600">Request Help</button>
            </div>
            <button onClick={() => router.push('/dashboard/user')} className="sm:hidden h-12 w-full bg-primary text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600">Request Help Now</button>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" /> No subscription required. Pay per service.
            </p>
          </div>
        </div>
        
        {/* Map Preview */}
        <div className="w-full lg:w-1/2 h-[450px] rounded-2xl overflow-hidden relative shadow-2xl group border border-slate-200 dark:border-slate-700">
          <div className="absolute inset-0 bg-slate-800 bg-[url('https://placeholder.pics/svg/800')] bg-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 flex flex-col justify-end p-6">
            <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 w-fit">
              <div className="w-10 h-10 rounded-full bg-slate-700 relative">
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <p className="text-white text-sm font-bold">Mike is 4 mins away</p>
                <p className="text-slate-400 text-xs">Tow Truck • 4.9 ★</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}