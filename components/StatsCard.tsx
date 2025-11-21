import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon }) => {
  return (
    <div className="glass-card p-8 rounded-3xl flex items-center gap-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl group relative overflow-hidden border border-white/60">
      {/* Subtle Liquid Background Animation on Hover */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-gray-200 to-transparent rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700"></div>
      
      <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white shadow-lg shadow-gray-300 flex items-center justify-center transition-transform group-hover:scale-110 duration-300 relative z-10">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      
      <div className="relative z-10">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};