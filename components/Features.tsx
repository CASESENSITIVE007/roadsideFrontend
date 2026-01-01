// components/Features.tsx
import { Car, Truck, BarChart3, ArrowRight } from 'lucide-react';

const FEATURE_CARDS = [
  { title: "For Drivers", icon: Car, color: "blue", desc: "Request help instantly without explaining where you are." },
  { title: "For Providers", icon: Truck, color: "emerald", desc: "Join our fleet to accept jobs nearby and manage earnings." },
  { title: "For Admins", icon: BarChart3, color: "purple", desc: "Monitor global fleet operations and view live analytics." },
];

export default function Features() {
  return (
    <div className="bg-background-light dark:bg-[#111418] py-16 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black mb-12 text-center lg:text-left">Dedicated tools for every user</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURE_CARDS.map((card) => {
            const IconComponent = card.icon;
            const colorClasses: Record<string, string> = {
              blue: 'text-blue-500',
              emerald: 'text-emerald-500',
              purple: 'text-purple-500'
            };
            return (
            <div key={card.title} className="rounded-xl border border-slate-200 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] p-6 hover:shadow-lg transition-shadow">
              <IconComponent className={`w-8 h-8 mb-4 ${colorClasses[card.color]}`} />
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-slate-600 dark:text-[#9dabb9] text-sm mb-6">{card.desc}</p>
              <a href="/register" className="text-primary font-bold text-sm flex items-center">Learn More <ArrowRight className="w-4 h-4 ml-1" /></a>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}