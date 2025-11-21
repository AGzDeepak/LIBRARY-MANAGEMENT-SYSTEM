import React from 'react';
import { User, Mail, Shield, Phone, X, Calendar, Hash } from 'lucide-react';
import { UserRole } from '../types';

interface ProfileModalProps {
  role: UserRole;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ role, onClose }) => {
  // Dummy data generator based on role
  const user = {
    name: role === 'admin' ? 'Administrator' : 'Library Member',
    email: role === 'admin' ? 'admin@library.edu' : 'user@library.edu',
    role: role,
    id: role === 'admin' ? 'ADM-001' : 'USR-2024-882',
    phone: role === 'admin' ? '+91 98765 43210' : '+91 99887 76655',
    department: role === 'admin' ? 'Central Library' : 'General Access',
    joinDate: 'Jan 15, 2024'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-[32px] p-0 w-full max-w-md relative animate-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Header Background */}
        <div className="h-32 bg-slate-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar & Main Info */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col items-center -mt-12 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-300 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-slate-400 mb-4">
              <User size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                role === 'admin' 
                ? 'bg-slate-100 text-slate-700 border-slate-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {user.role}
              </span>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-gray-500 text-xs font-medium">{user.department}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <div className="glass-input p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-slate-900 font-medium text-sm">{user.email}</p>
              </div>
            </div>

            <div className="glass-input p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                <Hash size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">System ID</p>
                <p className="text-slate-900 font-medium text-sm font-mono">{user.id}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 glass-input p-4 rounded-2xl flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-gray-400">
                    <Phone size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Phone</span>
                 </div>
                 <p className="text-slate-900 font-medium text-sm">{user.phone}</p>
              </div>
              <div className="flex-1 glass-input p-4 rounded-2xl flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Joined</span>
                 </div>
                 <p className="text-slate-900 font-medium text-sm">{user.joinDate}</p>
              </div>
            </div>
          </div>

          <button 
             onClick={onClose}
             className="w-full mt-8 bg-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:bg-slate-800 hover:scale-[1.01] transition-all active:scale-95"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};