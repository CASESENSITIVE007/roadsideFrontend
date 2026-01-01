// components/LiveMap.tsx
import { Truck } from 'lucide-react';

export default function LiveMap() {
  return (
    <section className="bg-white dark:bg-[#161b22] py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-2">
              Live Network Coverage
            </h2>
            <p className="text-slate-600 dark:text-[#9dabb9] text-sm">
              Real-time view of available units in your area.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge color="bg-green-500" label="Available" />
            <StatusBadge color="bg-amber-500" label="Busy" />
          </div>
        </div>

        <div className="relative w-full h-[400px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
          {/* Map Background simulation */}
          <div 
            className="w-full h-full bg-cover bg-center opacity-80 dark:opacity-60 grayscale dark:invert"
            style={{ backgroundImage: "url('https://placeholder.pics/svg/300')" }}
          />
          
          {/* Pulsing Unit Pins */}
          <MapPin top="25%" left="25%" unit="Unit #402" color="text-primary" />
          <MapPin top="50%" left="50%" unit="Unit #118 (Available)" color="text-green-500" active />
          <MapPin top="66%" left="75%" unit="Unit #099" color="text-primary" />

          {/* Floating Map CTA */}
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-64 bg-white/90 dark:bg-[#1c2127]/90 backdrop-blur p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">NEARBY</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-900 dark:text-white font-bold text-lg">12 Units</span>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">Active now</span>
            </div>
            <button className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded hover:opacity-90 transition-opacity">
              View Full Map
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <span className={`block w-2 h-2 rounded-full ${color}`}></span>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
}

function MapPin({ top, left, unit, color, active }: { top: string; left: string; unit: string; color: string; active?: boolean }) {
  return (
    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ top, left }}>
      <div className={`w-8 h-8 rounded-full ${active ? 'bg-green-500/20' : 'bg-primary/20'} flex items-center justify-center animate-pulse`}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Truck className={`w-5 h-5 ${color}`} />
      </div>
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {unit}
      </div>
    </div>
  );
}