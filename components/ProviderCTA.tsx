// components/ProviderCTA.tsx
'use client';
import { Handshake } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProviderCTA() {
  const router = useRouter();
  return (
    <section className="bg-background-light dark:bg-[#111418] py-20 border-t border-slate-200 dark:border-[#283039]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-2xl overflow-hidden relative shadow-2xl">
          {/* Decorative Backgrounds */}
          <div className="absolute inset-0 bg-blue-600 opacity-50 mix-blend-multiply"></div>
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          ></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center p-8 md:p-12 lg:p-16 gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
                Own a tow truck? Join our network.
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl">
                Get access to thousands of stranded drivers, automated dispatching, and guaranteed payouts. No monthly fees.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button onClick={() => router.push('/register?role=provider')} className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
                  Become a Provider
                </button>
                <button onClick={() => router.push('/register?role=provider')} className="px-8 py-3 bg-blue-700 text-white border border-blue-500 font-bold rounded-lg hover:bg-blue-600 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-inner">
                <Handshake className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}